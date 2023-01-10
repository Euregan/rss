module Main exposing (..)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation exposing (Key)
import Feed exposing (Feed)
import Html exposing (text)
import Http
import Json.Decode
import Nav
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
    }


type alias Flags =
    { jwt : Maybe String
    }


init : Flags -> Url -> Key -> ( Model, Cmd Msg )
init flags url key =
    ( { key = key
      , url = url
      , user = User.init flags.jwt
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
              }
            , Cmd.none
            )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


view : Model -> Document Msg
view model =
    { title = "RSS"
    , body = [ Nav.view model.user ]
    }
