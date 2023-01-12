module User exposing (..)

import Feed exposing (Feed)


type User
    = SignedOut String String Bool
    | Authenticated
        { jwt : String
        , feeds : List Feed
        }


init : Maybe String -> User
init maybeJwt =
    case maybeJwt of
        Nothing ->
            SignedOut "" "" False

        Just jwt ->
            Authenticated
                { jwt = jwt
                , feeds = []
                }
