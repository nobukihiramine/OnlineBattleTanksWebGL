'use strict';	// ���i���[�h�Ƃ���

// ���W���[��
const express = require( 'express' );
const http = require( 'http' );
const socketIO = require( 'socket.io' );
const Game = require( './libs/Game.js' );

// �I�u�W�F�N�g
const app = express();
const server = http.Server( app );
const io = socketIO( server );

// �萔
const PORT_NO = process.env.PORT || 1337;	// �|�[�g�ԍ��i���ϐ�PORT������΂�����A�������1337���g���j

// �Q�[���̍쐬�ƊJ�n
const game = new Game();
game.start( io );

// ���J�t�H���_�̎w��
app.use( express.static( __dirname + '/public' ) );

// �T�[�o�[�̋N��
server.listen(
    PORT_NO,	// �|�[�g�ԍ�
    () =>
    {
        console.log( 'Starting server on port %d', PORT_NO );
    } );
