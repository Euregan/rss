port module Main exposing (..)

import Array
import Authentication
import Browser exposing (Document, UrlRequest)
import Browser.Events
import Browser.Navigation
import Feed exposing (Feed)
import Html exposing (text)
import Http
import Item exposing (Item)
import Json.Decode
import Json.Encode
import Modal
import Nav
import Route exposing (Route(..))
import Subscriptions
import Time
import Url exposing (Url)
import User exposing (User(..))


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }


type alias Model =
    { key : Browser.Navigation.Key
    , url : Url
    , user : User
    , subscriptions : List Item
    , feed : Maybe Feed
    , item : Maybe Item
    }


type alias Flags =
    { jwt : Maybe String
    }


init : Flags -> Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { key = key
      , url = url
      , user = User.init flags.jwt
      , subscriptions = []
      , feed = Nothing
      , item = Nothing
      }
    , case flags.jwt of
        Nothing ->
            Cmd.none

        Just jwt ->
            Feed.fetch jwt ReceveidFeeds
    )
        |> handleUrl url


type Key
    = ArrowLeft
    | ArrowRight
    | Other


type Msg
    = LinkClicked UrlRequest
    | UrlChanged Url
    | ReceveidFeeds (Result Http.Error (List Feed))
    | ItemRead (Result Http.Error Time.Posix)
    | OnAuthenticationEmailChange String
    | OnAuthenticationPasswordChange String
    | OnAuthenticationSubmit
    | OnAuthenticated (Result Http.Error String)
    | OnKeyUp Key


handleUrl : Url -> ( Model, Cmd Msg ) -> ( Model, Cmd Msg )
handleUrl url ( model, cmd ) =
    let
        ( updatedItems, updatedUser ) =
            case model.item of
                Nothing ->
                    ( model.subscriptions, model.user )

                Just item ->
                    ( model.subscriptions |> List.filter (\i -> i.id /= item.id)
                    , case model.user of
                        Authenticated { jwt, feeds } ->
                            Authenticated
                                { jwt = jwt
                                , feeds =
                                    feeds
                                        |> List.map (\feed -> { feed | items = List.filter (\i -> i.id /= item.id) feed.items })
                                }

                        _ ->
                            model.user
                    )
    in
    case ( updatedUser, Route.fromUrl url ) of
        ( _, Just Route.Root ) ->
            ( { model
                | feed = Nothing
                , item = Nothing
                , subscriptions = updatedItems
                , user = updatedUser
              }
            , cmd
            )

        ( Authenticated user, Just (Route.Feed feedId) ) ->
            let
                maybeFeed =
                    List.head <| List.filter (\feed -> feed.id == feedId) user.feeds
            in
            ( { model
                | feed = maybeFeed
                , item = Nothing
                , subscriptions = updatedItems
                , user = updatedUser
              }
            , if maybeFeed == Nothing then
                Cmd.batch [ cmd, Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root ]

              else
                cmd
            )

        ( Authenticated user, Just (Route.Item maybeFeedId itemId) ) ->
            let
                maybeItem =
                    List.head <| List.filter (\feed -> feed.id == itemId) model.subscriptions
            in
            ( { model
                | feed = Maybe.andThen (\feedId -> List.head <| List.filter (\feed -> feed.id == feedId) user.feeds) maybeFeedId
                , item = maybeItem
                , subscriptions = updatedItems
                , user = updatedUser
              }
            , case maybeItem of
                Nothing ->
                    Cmd.batch
                        [ cmd
                        , Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root
                        ]

                Just item ->
                    Cmd.batch
                        [ cmd
                        , Item.saveRead user.jwt item ItemRead
                        ]
            )

        _ ->
            ( { model
                | feed = Nothing
                , item = Nothing
              }
            , Cmd.batch [ Browser.Navigation.pushUrl model.key <| Route.routeToString Route.Root, cmd ]
            )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        LinkClicked urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Browser.Navigation.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Browser.Navigation.load href )

        UrlChanged url ->
            handleUrl url ( model, Cmd.none )

        ReceveidFeeds (Err _) ->
            ( model, Cmd.none )

        ReceveidFeeds (Ok feeds) ->
            ( { model
                | user =
                    case model.user of
                        Authenticated user ->
                            Authenticated { user | feeds = feeds }

                        _ ->
                            model.user
                , subscriptions =
                    List.foldl (\feed acc -> List.concat [ feed.items, acc ]) [] feeds
                        |> List.sortBy (\item -> Time.posixToMillis item.publishedAt)
                        |> List.reverse
              }
            , feedsUpdated <| Json.Encode.list Feed.encode feeds
            )

        OnAuthenticationEmailChange email ->
            case model.user of
                SignedOut _ password False ->
                    ( { model | user = SignedOut email password False }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        OnAuthenticationPasswordChange password ->
            case model.user of
                SignedOut email _ False ->
                    ( { model | user = SignedOut email password False }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        OnAuthenticationSubmit ->
            case model.user of
                SignedOut email password False ->
                    ( { model | user = SignedOut email password True }
                    , Authentication.authenticate email password OnAuthenticated
                    )

                _ ->
                    ( model, Cmd.none )

        OnAuthenticated (Err _) ->
            ( model, Cmd.none )

        OnAuthenticated (Ok jwt) ->
            ( { model | user = User.Authenticated { jwt = jwt, feeds = [] } }
            , Cmd.batch
                [ Feed.fetch jwt ReceveidFeeds
                , jwtUpdated jwt
                ]
            )

        ItemRead _ ->
            ( model, Cmd.none )

        OnKeyUp key ->
            let
                find :
                    Item
                    -> List Item
                    -> ((Item -> ( Maybe Item, Maybe Item ) -> ( Maybe Item, Maybe Item )) -> ( Maybe Item, Maybe Item ) -> List Item -> ( Maybe Item, Maybe Item ))
                    -> Maybe Item
                find item items fold =
                    fold
                        (\i ( previous, found ) ->
                            if i.id == item.id then
                                ( Just i, previous )

                            else
                                ( Just i, found )
                        )
                        ( Nothing, Nothing )
                        items
                        |> Tuple.second
            in
            case ( key, model.user, model.item ) of
                ( ArrowLeft, Authenticated _, Just item ) ->
                    case model.feed of
                        Nothing ->
                            case find item model.subscriptions List.foldl |> Debug.log "ugh" of
                                Nothing ->
                                    ( model, Cmd.none )

                                Just nextItem ->
                                    ( model
                                    , Browser.Navigation.pushUrl
                                        model.key
                                        (Route.routeToString <| Route.Item Nothing nextItem.id)
                                    )

                        Just feed ->
                            case find item feed.items List.foldl of
                                Nothing ->
                                    ( model, Cmd.none )

                                Just nextItem ->
                                    ( model
                                    , Browser.Navigation.pushUrl
                                        model.key
                                        (Route.routeToString <| Route.Item (Just feed.id) nextItem.id)
                                    )

                ( ArrowRight, Authenticated _, Just item ) ->
                    case model.feed of
                        Nothing ->
                            case find item model.subscriptions List.foldr |> Debug.log "ugh" of
                                Nothing ->
                                    ( model, Cmd.none )

                                Just nextItem ->
                                    ( model
                                    , Browser.Navigation.pushUrl
                                        model.key
                                        (Route.routeToString <| Route.Item Nothing nextItem.id)
                                    )

                        Just feed ->
                            case find item feed.items List.foldr of
                                Nothing ->
                                    ( model, Cmd.none )

                                Just nextItem ->
                                    ( model
                                    , Browser.Navigation.pushUrl
                                        model.key
                                        (Route.routeToString <| Route.Item (Just feed.id) nextItem.id)
                                    )

                _ ->
                    ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    let
        toDirection string =
            case string of
                "ArrowLeft" ->
                    OnKeyUp ArrowLeft

                "ArrowRight" ->
                    OnKeyUp ArrowRight

                _ ->
                    OnKeyUp Other
    in
    Browser.Events.onKeyUp (Json.Decode.map toDirection (Json.Decode.field "key" Json.Decode.string))


view : Model -> Document Msg
view model =
    { title = "RSS"
    , body =
        [ Nav.view model.feed model.user
        , Subscriptions.view model.feed model.item model.subscriptions
        , Item.view model.item
        , case model.user of
            SignedOut email password loading ->
                Modal.view <|
                    Authentication.view
                        loading
                        email
                        password
                        OnAuthenticationEmailChange
                        OnAuthenticationPasswordChange
                        OnAuthenticationSubmit

            _ ->
                text ""
        ]
    }


port feedsUpdated : Json.Encode.Value -> Cmd msg


port jwtUpdated : String -> Cmd msg
