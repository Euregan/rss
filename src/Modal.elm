module Modal exposing (..)

import Html exposing (Html, div)
import Html.Attributes exposing (class)


view : Html msg -> Html msg
view content =
    div [ class "overlay" ] [ div [ class "modal" ] [ content ] ]
