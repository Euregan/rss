module Nav exposing (..)

import Feed exposing (Feed)
import Html exposing (Html, a, li, nav, text, ul)
import Html.Attributes exposing (class)
import Route
import User exposing (User(..))


view : Maybe Feed -> User -> Html msg
view maybeSelectedFeed user =
    let
        itemClass : Maybe Feed -> String
        itemClass maybeFeed =
            case ( maybeFeed, maybeSelectedFeed ) of
                ( Nothing, Nothing ) ->
                    "active"

                ( Just feed, Just selectedFeed ) ->
                    if feed.id == selectedFeed.id then
                        "active"

                    else
                        ""

                _ ->
                    ""
    in
    nav [ class "pane" ]
        [ case user of
            SignedOut ->
                ul [ class "menu" ] []

            Authenticated { feeds } ->
                ul [ class "menu" ] <|
                    li [ class <| itemClass Nothing ] [ a [ Route.href Route.Root ] [ text "Inbox" ] ]
                        :: List.map (\feed -> li [ class <| itemClass <| Just feed ] [ a [ Route.href <| Route.Feed feed.id ] [ text feed.label ] ]) feeds
        , case user of
            SignedOut ->
                ul [ class "menu" ] []

            Authenticated _ ->
                ul [ class "menu" ]
                    [ li [] [ text "Settings" ]
                    , li [] [ text "Sign out" ]
                    ]
        ]
