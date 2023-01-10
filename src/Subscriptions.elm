module Subscriptions exposing (..)

import Feed exposing (Feed)
import Html exposing (Html, a, li, text, ul)
import Html.Attributes exposing (class, href)
import Item exposing (Item)


view : Maybe Feed -> List Item -> Html msg
view maybeFeed items =
    let
        url =
            case maybeFeed of
                Nothing ->
                    "/feed/all/"

                Just feed ->
                    "/feed/" ++ feed.id ++ "/"
    in
    items
        |> List.map (\item -> li [] [ a [ href <| url ++ item.id ] [ text item.label ] ])
        |> ul [ class "pane menu" ]
