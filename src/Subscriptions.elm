module Subscriptions exposing (..)

import Feed exposing (Feed)
import Html exposing (Html, a, li, text, ul)
import Html.Attributes exposing (class)
import Item exposing (Item)
import Route exposing (Route)


view : Maybe Feed -> List Item -> Html msg
view maybeFeed items =
    let
        url : String -> Route
        url itemId =
            case maybeFeed of
                Nothing ->
                    Route.Root

                Just feed ->
                    Route.Item feed.id itemId
    in
    items
        |> List.map (\item -> li [] [ a [ Route.href <| url item.id ] [ text item.label ] ])
        |> ul [ class "pane menu" ]
