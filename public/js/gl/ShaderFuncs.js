// シェーダーの読み込み
function loadShader( gl, iType, strSource )
{
    const shader = gl.createShader( iType );    // シェーダーの作成（タイプは、gl.VERTEX_SHADER もしくは、gl.FRAGMENT_SHADER
    gl.shaderSource( shader, strSource );    // シェーダーにソースコードを割り当てる
    gl.compileShader( shader );    // シェーダーのソースコードをコンパイル
    if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
    {   // コンパイルの成否をチェック
        alert( 'An error occurred compiling the shaders: ' + gl.getShaderInfoLog( shader ) );
        gl.deleteShader( shader );
        return null;
    }
    return shader;
}

// シェーダープログラムの構築
function setupShaderProgram( gl, shaderProgram, strSourceVertexShader, strSourceFragmentShader )
{
    // ２つのシェーダーのロード、コンパイル
    const shaderVertex = loadShader( gl, gl.VERTEX_SHADER, strSourceVertexShader );  // 頂点シェーダーの読み込み
    const shaderFragment = loadShader( gl, gl.FRAGMENT_SHADER, strSourceFragmentShader );  // フラグメントシェーダーの読み込み
    if( null === shaderVertex || null === shaderFragment )
    {
        return false;
    }

    // シェーダーのリンク
    gl.attachShader( shaderProgram, shaderVertex ); // シェーダープログラムに頂点シェーダーを登録
    gl.attachShader( shaderProgram, shaderFragment ); // シェーダープログラムにフラグメントシェーダーを登録
    gl.linkProgram( shaderProgram ); // シェーダをリンク
    if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) )
    {   // リンクの成否をチェック
        alert( 'Unable to initialize the shader program: ' + gl.getProgramInfoLog( shaderProgram ) );
        return false;
    }
    return true;
}
