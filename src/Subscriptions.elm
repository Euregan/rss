module Subscriptions exposing (..)

import Feed exposing (Feed)
import Html exposing (Html, a, li, text, ul)
import Html.Attributes exposing (class)
import Item exposing (Item)
import Route exposing (Route)


view : Maybe Feed -> Maybe Item -> List Item -> Html msg
view maybeFeed maybeSelectedItem items =
    let
        url : String -> Route
        url itemId =
            Route.Item (Maybe.map .id maybeFeed) itemId

        itemClass : Item -> String
        itemClass item =
            case maybeSelectedItem of
                Nothing ->
                    ""

                Just selectedItem ->
                    if item.id == selectedItem.id then
                        "active"

                    else
                        ""
    in
    (case maybeFeed of
        Nothing ->
            items

        Just feed ->
            feed.items
    )
        |> List.map (\item -> li [ class <| itemClass item ] [ a [ Route.href <| url item.id ] [ text item.label ] ])
        |> ul [ class "pane menu" ]
