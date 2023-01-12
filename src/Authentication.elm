module Authentication exposing (..)

import Html exposing (Html, button, footer, form, input, label, text)
import Html.Attributes exposing (disabled, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Http
import Json.Decode
import Json.Encode


authenticate : String -> String -> (Result Http.Error String -> msg) -> Cmd msg
authenticate email password onAuthenticated =
    Http.request
        { method = "POST"
        , headers = []
        , url = "/api/authenticate"
        , body = Http.jsonBody <| Json.Encode.object [ ( "email", Json.Encode.string email ), ( "password", Json.Encode.string password ) ]
        , expect = Http.expectJson onAuthenticated <| Json.Decode.field "token" Json.Decode.string
        , timeout = Nothing
        , tracker = Nothing
        }


view : Bool -> String -> String -> (String -> msg) -> (String -> msg) -> msg -> Html msg
view loading email password onEmailChange onPasswordChange submit =
    form [ onSubmit submit ]
        [ label []
            [ text "Email"
            , input [ type_ "email", value email, onInput onEmailChange, disabled loading ] []
            ]
        , label []
            [ text "Password"
            , input [ type_ "password", value password, onInput onPasswordChange, disabled loading ] []
            ]
        , footer []
            [ button [ type_ "submit", disabled loading ] [ text "Create account" ]
            , button [ type_ "submit", disabled loading ] [ text "Sign in" ]
            ]
        ]
