module Nav exposing (..)

import Feed exposing (Feed)
import Html exposing (Html, a, li, nav, text, ul)
import Html.Attributes exposing (class, href)
import Url exposing (Url)
import User exposing (User(..))


view : Url -> User -> Html msg
view url user =
    let
        itemClass : Maybe Feed -> String
        itemClass maybeFeed =
            case maybeFeed of
                Nothing ->
                    if String.startsWith "/feed/all" url.path then
                        "active"

                    else
                        ""

                Just feed ->
                    if String.contains feed.id url.path then
                        "active"

                    else
                        ""
    in
    nav [ class "pane" ]
        [ case user of
            SignedOut ->
                ul [ class "menu" ] []

            Authenticated { feeds } ->
                ul [ class "menu" ] <|
                    li [ class <| itemClass Nothing ] [ a [ href "/feed/all" ] [ text "Inbox" ] ]
                        :: List.map (\feed -> li [] [ a [ href <| "/feed/" ++ feed.id ] [ text feed.label ] ]) feeds
        , case user of
            SignedOut ->
                ul [ class "menu" ] []

            Authenticated _ ->
                ul [ class "menu" ]
                    [ li [] [ text "Settings" ]
                    , li [] [ text "Sign out" ]
                    ]
        ]
