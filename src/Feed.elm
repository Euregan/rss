module Feed exposing (..)

import Item exposing (Item)
import Json.Decode exposing (Decoder)


type alias Feed =
    { id : String
    , label : String
    , items : List Item
    }


decoder : Decoder Feed
decoder =
    Json.Decode.map3 Feed
        (Json.Decode.field "id" Json.Decode.string)
        (Json.Decode.field "label" Json.Decode.string)
        (Json.Decode.field "items" <| Json.Decode.list Item.decoder)
