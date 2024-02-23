let cvs;//キャンバス
let player;//プレイヤー
let start;//スタートの床
let bkgGroup;//背景グループ
let ssGroup;//シーシャグループ
let retryLabel;//リトライラベル
let titleLabel;//タイトルラベル
let setsumei;//説明
let isPaused = false;
let gameState = "title";
let speed = 2;//速度の初期値
let time=0;//時間
let clicked=false;
const padY=240;//シーシャの上下の間隔

let scoreNum;//スコア
let scoreLabel;//スコアラベル

function preload(){
	bgImg =loadImage("tennai.png");
	firstBgImg=loadImage("bgk.png");
	ssImg =loadImage("shisha.png");
	pyImg =loadImage("ikeda.png");
	titleImg = loadImage("title2.png");
	setsumeiImg = loadImage("setumei.png");
	bgm = loadSound("bgm.mp3");
}

function setup() {
	//キャンバスの準備
	cvs = new Canvas(480,320)
	bgm.setVolume(0.5);
	bgm.loop();
	world.gravity.y=12;//重力を設定する
	//タイトル
	createTitleLabel(width/2,height/2);
	//説明
	createSetsumei(width/2,height/2);
	//プレイヤー
	createPlayer(width/2,height/2);
	//スタート床
	createStartFloor(width/2, height/2+60);
	//背景グループ
	bkgGroup = new Group();
	bkgGroup.layer = 1;//スプライトの重なり
	//背景
	createBkg();

	//シーシャグループ
	ssGroup =new Group();
	ssGroup.layer =2;//スプライトの重なり
	
	const padX=width/2;//シーシャのX間隔
	//const padY=240;//シーシャの上下の間隔
	
	for(let i=0;i<3;i++){//３列作る
		const x = i * padX+width;//シーシャのX座標
		const y = height/2;//シーシャのY座標
		//上のシーシャ
		const ssA = new ssGroup.Sprite(x,y-padY);
		ssA.width =52;
		ssA.height =360;
		ssA.collider="static";
		ssA.image=ssImg;
		//下のシーシャ
		const ssB= new ssGroup.Sprite(x,y+padY);
		ssB.width =52;
		ssB.height =360;
		ssB.collider="static";
		ssB.image=ssImg;
	}
	
	//スコア初期化
	scoreNum=0;
	
	//スコアラベル
	scoreLabel = new Sprite(width/4,32);
	scoreLabel.color ="#00000000";
	scoreLabel.stroke="#00000000";
	scoreLabel.collider="none";
	scoreLabel.layer=4;
	scoreLabel.textSize=40;
	scoreLabel.textColor="#383838";
	scoreLabel.text="Score:"+scoreNum;
	
	//リトライラベル
	retryLabel = new Sprite();
	retryLabel.width=width;
	retryLabel.height=height;
	retryLabel.fill ='#00000000';
	retryLabel.stroke = '#00000000';
	//retryLabel.color="transparent";
	retryLabel.collider="static";
	//retryLabel.w=6;
	retryLabel.layer=99;
	retryLabel.textSize=50;
	retryLabel.textColor="#000";
	retryLabel.text="Retry";
	retryLabel.visible = false;
	retryLabel.overlap(player);
	
}

function draw() {
	//背景色
	background(firstBgImg);
	//キーボード
	if(gameState=="play"&&!titleLabel.visible){
		if(kb.presses("right")){
			speed +=Math.floor((millis()-time)/100)/100;
			player.vel.x=speed;
			player.vel.y=-5;
		}
	}
	//タッチ画面
	if(gameState=="play"&&!titleLabel.visible){
		for(let touch of touches){
		//if(!gameOver&&!titleLabel.visible){
			if(touch.presses()){
				speed +=Math.floor((millis()-time)/100)/100;
				player.vel.x=speed;
		  	player.vel.y=-5;
			}
		}
	}
	
	//画面外判定（プレイヤー）
	//プレイヤーY座標が0以下の場合
	if(player.y<0)player.y=0;
	//プレイヤーY座標が高さ以上の場合
	if(height<player.y)player.y=height;
	//プレイヤーX座標が0以下の場合
	if(player.x<0)player.x=0;
	
	//カメラ
	camera.x=player.x;//プレイヤーと同じX座標にする
	
	//背景ループ
	for(let bkg of bkgGroup){
		//プレイヤーが画面端に到達したとき
		if(bkg.x<player.x-width){
			//背景のX座標を横の二倍を足して代入（元の位置に戻す）
			bkg.x += width*2;
		}
	}
	//シーシャループ
	for(let i=0;i<ssGroup.length;i+=2){//２個ずつ取り出す
		const ssA = ssGroup[i];//上のシーシャ
		const ssB = ssGroup[i+1];//下のシーシャ
		if(ssA.x<player.x-width/2){
			//Y座標をランダム
			const y = height/2 + random(-height/10,height/10);
			const padY =240;
			//シーシャの再配置
			ssA.x = player.x+width;
			ssA.y = y-padY;
			ssB.x = player.x+width;
			ssB.y = y+padY;
		}
	}
	
	//スコア
	const score = player.x - width/2;
	if(scoreNum < score)scoreNum=score;
	//スコアラベル
	scoreLabel.x=player.x-120;
	scoreLabel.text="Score:"+floor(scoreNum);
	
	//ゲームオーバー判定
	//ゲームオーバーじゃないとき
	if(gameState=="title"){
		//タイトルを押したとき
		if(mouse.pressing()){
			titleLabel.visible = false;
			gameState="play";
			//gameState="setsumei";
		}
	}
	/*
	if(gameState=="setsumei"){
		setsumei.visible=true;
		gameState = "setsumeiAto";
	}
	*/
	/*
	if(gameState =="setsumeiAto"){
			if(mouse.pressing()){
				if(clicked){
					gameState="play";
					setsumei.visible=false;
					clicked = false;
				}else{
					clicked = true;
				}		
			}
	}
	*/
	if(gameState=="play"){
		//シーシャにプレイヤーが当たった場合
		player.collided(ssGroup,(a,b)=>{
			gameState="gameOver";
			player.collider="static";
			retryLabel.visible = true;
			retryLabel.x=player.x;
		});
	}
	if(gameState=="gameOver"){
		if(mouse.pressing()&&retryLabel.visible){
			retryLabel.visible = false;
			retryGame();
			for(let i=0;i<ssGroup.length;i+=2){//３列作る
				ssGroup[i].x=i*(width/2)+width;
				ssGroup[i].y=height/2-padY;
				ssGroup[i+1].x=i*(width/2)+width;
				ssGroup[i+1].y=height/2+padY;
			}
		}
	}
}

//タイトルを作る関数
function createTitleLabel(x,y){
	titleLabel = new Sprite(x,y);
	titleLabel.width = 480;
	titleLabel.height = 320;
	titleLabel.color = "#00000000";
	titleLabel.image = titleImg;//タイトルの画像
	titleLabel.layer= 98;//スプライトの重なり
	titleLabel.collider = "none";
	titleLabel.visible=true;
}
//説明を作る関数
function createSetsumei(x,y){
	setsumei = new Sprite(x,y);
	setsumei.width = 480;
	setsumei.height = 320;
	//setsumei.color = "#00000000";
	setsumei.image = setsumeiImg;//タイトルの画像
	setsumei.layer= 97;//スプライトの重なり
	setsumei.collider = "none";
	setsumei.visible=false;
}

//プレイヤーを作る関数
function createPlayer(x,y){
	player = new Sprite(x,y);
	player.width = 35;
	player.height = 35;
	player.color = "orange";
	player.image = pyImg;//プレイヤーの画像
	player.layer= 9;//スプライトの重なり
	player.collider = "dynamic";
	//コライダーの枠をセット
	//player.debug = true;
}
//スタートの床を作る関数
function createStartFloor(x,y){
	start = new Sprite(x,y);
	start.width=90;
	start.height=5;
	start.color="peru";
	start.stroke="saddlebrown";
	start.collider="static";
	start.layer=9;//スプライトの重なり
}

function retryGame(){
	//リトライラベルがクリックされた挙動
	gameState="play";
	//スコアを初期化
	scoreNum =0;
	speed =2;
	time=millis();
	
	//リトライラベルを消す
	retryLabel.visible = false;
	retryLabel.overlap(player);
	//プレイヤーを初期位置に戻す
	player.remove();
	createPlayer(width/2,height/2);
	player.collider="dynamic";
	createStartFloor(width/2, height/2+60);
	createBkg();
	retryLabel.overlap(player);
}

function createBkg(){
	for(let i=0;i<2;i++){
		const x =i * width;
		const bkg = new bkgGroup.Sprite(x,height/2);
		bkg.width = 480;
		bkg.height = 320;
		bkg.collider = "none";
		bkg.image = bgImg;
	}
}

