module Item exposing (..)

import Html exposing (Html, div, h3, text)
import Html.Attributes exposing (class)
import Html.Parser
import Html.Parser.Util
import Json.Decode exposing (Decoder)
import Json.Encode
import Time exposing (Posix)


type alias Item =
    { id : String
    , label : String
    , publishedAt : Posix
    , description : String
    }


decoder : Decoder Item
decoder =
    Json.Decode.map4 Item
        (Json.Decode.field "id" Json.Decode.string)
        (Json.Decode.field "label" Json.Decode.string)
        (Json.Decode.field "publishedAt" <| Json.Decode.map Time.millisToPosix Json.Decode.int)
        (Json.Decode.field "description" Json.Decode.string)


encode : Item -> Json.Encode.Value
encode item =
    Json.Encode.object
        [ ( "id", Json.Encode.string item.id )
        , ( "label", Json.Encode.string item.label )
        , ( "publishedAt", Json.Encode.int <| Time.posixToMillis item.publishedAt )
        , ( "description", Json.Encode.string item.description )
        ]


view : Maybe Item -> Html msg
view maybeItem =
    div [ class "pane item" ] <|
        case maybeItem of
            Nothing ->
                []

            Just item ->
                [ h3 [] [ text item.label ]
                , div [] <| textToHtml item.description
                ]


textToHtml : String -> List (Html msg)
textToHtml text =
    case Html.Parser.run text of
        Ok nodes ->
            Html.Parser.Util.toVirtualDom nodes

        Err _ ->
            []
