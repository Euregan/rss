module Feed exposing (..)

import Item exposing (Item)
import Json.Decode exposing (Decoder)
import Json.Encode


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


encode : Feed -> Json.Encode.Value
encode feed =
    Json.Encode.object
        [ ( "id", Json.Encode.string feed.id )
        , ( "label", Json.Encode.string feed.label )
        , ( "items", Json.Encode.list Item.encode feed.items )
        ]
