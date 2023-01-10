module Feed exposing (..)

import Json.Decode exposing (Decoder)


type alias Feed =
    { label : String
    }


decoder : Decoder Feed
decoder =
    Json.Decode.map Feed
        (Json.Decode.field "label" Json.Decode.string)
