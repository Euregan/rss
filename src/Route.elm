module Route exposing (..)

import Browser.Navigation
import Feed exposing (Feed)
import Html exposing (Attribute)
import Html.Attributes as Attr
import Item exposing (Item)
import Url exposing (Url)
import Url.Parser exposing ((</>), Parser, oneOf, s, string)


type Route
    = Root
    | Feed String
    | Item (Maybe String) String


parser : Parser (Route -> a) a
parser =
    oneOf
        [ Url.Parser.map Root (s "feed" </> s "all")
        , Url.Parser.map Feed (s "feed" </> string)
        , Url.Parser.map Item (s "feed" </> feedParser </> string)
        ]


feedParser : Parser (Maybe String -> a) a
feedParser =
    Url.Parser.custom "FEED" <|
        \segment ->
            if segment == "all" then
                Just Nothing

            else
                Just (Just segment)



-- PUBLIC HELPERS


href : Route -> Attribute msg
href targetRoute =
    Attr.href (routeToString targetRoute)


fromUrl : Url -> Maybe Route
fromUrl =
    Url.Parser.parse parser



-- INTERNAL


routeToString : Route -> String
routeToString page =
    "/" ++ String.join "/" (routeToPieces page)


routeToPieces : Route -> List String
routeToPieces page =
    case page of
        Root ->
            [ "feed", "all" ]

        Feed feed ->
            [ "feed", feed ]

        Item feed item ->
            [ "feed", Maybe.withDefault "all" feed, item ]
