'use strict';	// 厳格モードとする

// モジュール
const express = require( 'express' );
const http = require( 'http' );
const socketIO = require( 'socket.io' );
const Game = require( './libs/Game.js' );

// オブジェクト
const app = express();
const server = http.Server( app );
const io = socketIO( server );

// 定数
const PORT_NO = process.env.PORT || 1337;	// ポート番号（環境変数PORTがあればそれを、無ければ1337を使う）

// ゲームの作成と開始
const game = new Game();
game.start( io );

// 公開フォルダの指定
app.use( express.static( __dirname + '/public' ) );

// サーバーの起動
server.listen(
    PORT_NO,	// ポート番号
    () =>
    {
        console.log( 'Starting server on port %d', PORT_NO );
    } );
