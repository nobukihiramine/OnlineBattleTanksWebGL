// 描画に関する設定クラス
class RenderingSettings
{
    // 背景タイルのサイズ
    static get FIELDTILE_WIDTH() { return 512; }
    static get FIELDTILE_HEIGHT() { return 512; }

    // フィールド
    static get FIELD_LINECOLOR() { return 'blue'; }
    static get FIELD_LINEWIDTH() { return 5; }

    // 処理時間
    static get PROCESSINGTIME_FONT() { return '30px Bold Arial'; }
    static get PROCESSINGTIME_COLOR() { return 'black'; }

    // スコア
    static get SCORE_FONT() { return '30px Bold Arial'; }
    static get SCORE_COLOR() { return 'black'; };
    
    // ニックネーム
    static get NICKNAME_FONT() { return '30px Bold Arial'; }
    static get NICKNAME_COLOR() { return 'blue'; }
}
