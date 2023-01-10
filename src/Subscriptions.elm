module Subscriptions exposing (..)

import Html exposing (Html, a, li, text, ul)
import Html.Attributes exposing (class, href)
import Item exposing (Item)
import Url exposing (Url)


view : Url -> List Item -> Html msg
view url items =
    items
        |> List.map (\item -> li [] [ a [ href <| "/feed/all/" ++ item.id ] [ text item.label ] ])
        |> ul [ class "pane menu" ]
