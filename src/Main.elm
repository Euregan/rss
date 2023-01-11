module Main exposing (..)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Feed exposing (Feed)
import Http
import Item exposing (Item)
import Json.Decode
import Nav
import Route exposing (Route(..))
import Subscriptions
import Time
import Url exposing (Url)
import User exposing (User(..))


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }


type alias Model =
    { key : Key
    , url : Url
    , user : User
    , subscriptions : List Item
    , feed : Maybe Feed
    , item : Maybe Item
    }


type alias Flags =
    { jwt : Maybe String
    }


init : Flags -> Url -> Key -> ( Model, Cmd Msg )
init flags url key =
    ( { key = key
      , url = url
      , user = User.init flags.jwt
      , subscriptions = []
      , feed = Nothing
      , item = Nothing
      }
    , case flags.jwt of
        Nothing ->
            Cmd.none

        Just jwt ->
            Http.request
                { method = "GET"
                , headers = [ Http.header "Authorization" <| "Bearer " ++ jwt ]
                , url = "/api/feeds"
                , body = Http.emptyBody
                , expect = Http.expectJson ReceveidFeeds (Json.Decode.list Feed.decoder)
                , timeout = Nothing
                , tracker = Nothing
                }
    )
        |> handleUrl url


type Msg
    = LinkClicked UrlRequest
    | UrlChanged Url
    | ReceveidFeeds (Result Http.Error (List Feed))


handleUrl : Url -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
handleUrl url ( model, cmd ) =
    case ( model.user, Route.fromUrl url ) of
        ( _, Just Route.Root ) ->
            ( { model
                | feed = Nothing
                , item = Nothing
              }
            , cmd
            )

        ( Authenticated user, Just (Route.Feed feedId) ) ->
            let
                maybeFeed =
                    List.head <| List.filter (\feed -> feed.id == feedId) user.feeds
            in
            ( { model
                | feed = maybeFeed
                , item = Nothing
              }
            , if maybeFeed == Nothing then
                Cmd.batch [ cmd, Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root ]

              else
                cmd
            )

        ( Authenticated user, Just (Route.Item maybeFeedId itemId) ) ->
            let
                maybeItem =
                    List.head <| List.filter (\feed -> feed.id == itemId) model.subscriptions
            in
            ( { model
                | feed = Maybe.andThen (\feedId -> List.head <| List.filter (\feed -> feed.id == feedId) user.feeds) maybeFeedId
                , item = maybeItem
              }
            , if maybeItem == Nothing then
                Cmd.batch [ cmd, Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root ]

              else
                cmd
            )

        _ ->
            ( { model
                | feed = Nothing
                , item = Nothing
              }
            , Cmd.batch [ Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root, cmd ]
            )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Browser.Navigation.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Browser.Navigation.load href )

        UrlChanged url ->
            handleUrl url ( model, Cmd.none )

        ReceveidFeeds (Err _) ->
            ( model, Cmd.none )

        ReceveidFeeds (Ok feeds) ->
            ( { model
                | user =
                    case model.user of
                        Authenticated user ->
                            Authenticated { user | feeds = feeds }

                        _ ->
                            model.user
                , subscriptions =
                    List.foldl (\feed acc -> List.concat [ feed.items, acc ]) [] feeds
                        |> List.sortBy (\item -> Time.posixToMillis item.publishedAt)
              }
            , Cmd.none
            )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


view : Model -> Document Msg
view model =
    { title = "RSS"
    , body =
        [ Nav.view model.feed model.user
        , Subscriptions.view model.feed model.item model.subscriptions
        , Item.view model.item
        ]
    }
