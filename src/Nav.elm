module Nav exposing (..)

import Html exposing (Html, li, nav, text, ul)
import User exposing (User(..))


view : User -> Html msg
view user =
    nav []
        [ case user of
            SignedOut ->
                ul [] []

            Authenticated { feeds } ->
                ul [] <| List.map (\feed -> li [] [ text feed.label ]) feeds
        , case user of
            SignedOut ->
                ul [] []

            Authenticated _ ->
                ul []
                    [ li [] [ text "Settings" ]
                    , li [] [ text "Sign out" ]
                    ]
        ]
