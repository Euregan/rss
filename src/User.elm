module User exposing (..)

import Feed exposing (Feed)


type User
    = SignedOut
    | Authenticated
        { jwt : String
        , feeds : List Feed
        }


init : Maybe String -> User
init maybeJwt =
    case maybeJwt of
        Nothing ->
            SignedOut

        Just jwt ->
            Authenticated
                { jwt = jwt
                , feeds = []
                }
