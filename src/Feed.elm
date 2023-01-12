module Feed exposing (..)

import Http
import Item exposing (Item)
import Json.Decode exposing (Decoder)
import Json.Encode


type alias Feed =
    { id : String
    , label : String
    , items : List Item
    }


fetch : String -> (Result Http.Error (List Feed) -> msg) -> Cmd msg
fetch jwt onFeedsReceived =
    Http.request
        { method = "GET"
        , headers = [ Http.header "Authorization" <| "Bearer " ++ jwt ]
        , url = "/api/feeds"
        , body = Http.emptyBody
        , expect = Http.expectJson onFeedsReceived (Json.Decode.list decoder)
        , timeout = Nothing
        , tracker = Nothing
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
