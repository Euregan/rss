module Main exposing (..)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Feed exposing (Feed)
import Http
import Item exposing (Item)
import Json.Decode
import Nav
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
      }
    , case flags.jwt of
        Nothing ->
            Cmd.none

        Just jwt ->
            Cmd.batch
                [ Http.request
                    { method = "GET"
                    , headers = [ Http.header "Authorization" <| "Bearer " ++ jwt ]
                    , url = "/api/feeds"
                    , body = Http.emptyBody
                    , expect = Http.expectJson ReceveidFeeds (Json.Decode.list Feed.decoder)
                    , timeout = Nothing
                    , tracker = Nothing
                    }
                , Browser.Navigation.pushUrl key "/feed/all"
                ]
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
            ( { model | url = url }
            , Cmd.none
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
        [ Nav.view model.url model.user
        , Subscriptions.view model.url model.subscriptions
        , Item.view <| List.head <| List.filter (\item -> String.contains item.id model.url.path) model.subscriptions
        ]
    }
