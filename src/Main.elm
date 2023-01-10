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


type Msg
    = LinkClicked UrlRequest
    | UrlChanged Url
    | ReceveidFeeds (Result Http.Error (List Feed))


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
            case model.user of
                SignedOut ->
                    ( model, Cmd.none )

                Authenticated user ->
                    case Route.fromUrl url of
                        Just Route.Root ->
                            ( { model
                                | feed = Nothing
                                , item = Nothing
                              }
                            , Cmd.none
                            )

                        Just (Route.Feed feedId) ->
                            ( { model
                                | feed = List.head <| List.filter (\feed -> feed.id == feedId) user.feeds
                                , item = Nothing
                              }
                            , Cmd.none
                            )

                        Just (Route.Item feedId itemId) ->
                            ( { model
                                | feed = List.head <| List.filter (\feed -> feed.id == feedId) user.feeds
                                , item = List.head <| List.filter (\feed -> feed.id == itemId) model.subscriptions
                              }
                            , Cmd.none
                            )

                        _ ->
                            ( { model
                                | feed = Nothing
                                , item = Nothing
                              }
                            , Browser.Navigation.pushUrl model.key "/feed/all"
                            )

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
        , Subscriptions.view model.feed model.subscriptions
        , Item.view model.item
        ]
    }
