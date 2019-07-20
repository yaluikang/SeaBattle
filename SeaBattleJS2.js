let initialParameters = {
    'cellCount': 10,
    'cellSize': 50,
    'ships': [[],[4, 'fourdeck',[600,175],[550,10]],
	[3, 'tripledeck',[600,120],[600,10]],
	[2, 'doubledeck',[600,65],[650,10]],
	[1, 'singledeck',[600,10],[700,10]]]
};
let humansShips; //Переменная для подсчета количества оставшихся кораблей пользователя
let compsShips; //Переменная для подсчета количества оставшихся кораблей компьютера
let fieldCoords = getElementById('field').getBoundingClientRect(); //координаты игрового поля пользователя
let compsFieldCoords = getElementById('computersField').getBoundingClientRect(); //координаты игрового поля компьютера
let coordsOfField = {}; //объект координат поля пользователя
let compsCoordsOfField = {}; //объект координат поля компьютера
let arrForBotTurns = createArr(); //массив свободных координат для ходов бота
let hit = []; //массив координат для второго хода попаданий бота
let allHits = []; //массив всех попаданий бота по атакованному кораблю
let theThirdHit = []; //массив координат для третьево хода попаданий бота
let theFirstHit; //первое попадание бота по найденному кораблю
let sizeOfTargetShip = 0; //переменная для помощи боту в опредлении гибели атакованного корабля
let objForShips = {}; //объект всех кораблей пользователя с их координатами
let objForComsShips = {}; //объект всех кораблей бота с их координатами
function getElementById(id){
    return document.getElementById(id);
};
fieldDrawing(getElementById('field'),'humansRow','humansCell'); //отрисовка дивами координат
setCoordsObject(compsCoordsOfField); //отрисовка координат в объекте для поля компа
fieldDrawing(getElementById('computersField'),'compsRow','compsCell'); //отрисовка дивами координат компа
fieldDrawing(getElementById('setInvisForField'),'invisRow','invisCell'); //отрисовка дивами координат поля,которое закрывает поле компа
setCoordsObject(coordsOfField); //создание координат в объекте
class Ships {  //класс с методами для кораблей
    constructor(elem){
        this.elem = elem;
        this.offsetX = this.elem.offsetWidth;
        this.number = check(this.elem)[0];
        this.position = check(this.elem)[1];
        this.begin;
        this.pos = check(this.elem)[1];
        this.n = check(this.elem)[0];
    }
    dragEvent(){
        this.elem.addEventListener('drag',function(){
            this.style.top = event.pageY+'px';
            this.style.left = event.pageX+'px';
        });
        return this;
    }
    dragendEvent(){
        let n = this.n;
        let pos = check(this.elem)[1];
        this.elem.addEventListener('dragend',function(){
            let defaultPosition = getDefaultPosition(this);
            pos = check(this)[1];
            let xCoord = event.pageX - fieldCoords.left;
            let yCoord = event.pageY - fieldCoords.top;
            this.style.top = +MyRound10(yCoord)+ fieldCoords.top + 'px';
            this.style.left = +MyRound10(xCoord)+ fieldCoords.left + 'px';
            let coords = this.getBoundingClientRect();
            let withinTheField;
            let xx = +MyRound10(xCoord);
            let yy = +MyRound10(yCoord);
            let begin = getCoordOfSheep(xx,yy)*1;
            //проверка в зависимости от положения корабля
            if(!ruy(begin,pos,n,true) || eval(conditions(pos))){
                this.style.top = defaultPosition[1] + 'px';
                this.style.left = defaultPosition[0] + 'px';
                this.classList.add('drag');
                return this;
            }
            this.classList.remove('drag');
            setAccupied(begin,n,pos,true);      
        });
        return this;
    }
    dragstartEvent(){
        let n = check(this.elem)[0];
        let pos = this.setN();
        this.elem.addEventListener('dragstart',function(){
            pos = check(this)[1];
            let coords = this.getBoundingClientRect();
            let xx = coords.left - fieldCoords.left;
            let yy = coords.top - fieldCoords.top;
            if(xx > initialParameters['cellCount']*initialParameters['cellSize'] || yy > initialParameters['cellCount']*initialParameters['cellSize']){
                return this;
            }
            let begin = getCoordOfSheep(xx,yy)*1;
            setAccupied(begin,n,pos,false);
        });
        return this;
    }
    setN(){
        this.pos = check(this.elem)[1];;
    }
}
//функция,которая возвращает условия проверки корабля,в зависимости от его положения
function conditions(pos){
    if(pos == 'horizontal'){
        return "xx + n*initialParameters['cellSize'] > initialParameters['cellSize']*initialParameters['cellCount']"
    } else {
        return "yy + n*initialParameters['cellSize'] > initialParameters['cellSize']*initialParameters['cellCount']"
    }
};
function MyRound10(val){ //округляет координаты мышки до нужных размеров
    return Math.floor(val/initialParameters['cellSize'])*initialParameters['cellSize'];
};
function check(elem){ //проверяет на то,какой корабль(гор или верт) и возращается длину с длиной палубы 
    let x = (elem.offsetWidth-2)/initialParameters['cellSize'];
    let y = (elem.offsetHeight-2)/initialParameters['cellSize'];
    if(x > y){
        return [x,'horizontal'];
    } else {
        return [y,'vertical'];
    }
};
function getCoordOfSheep(xx,yy){ //возвращает позицию первой палубы корабля в объекте координат
    for(let i in coordsOfField){
        if((coordsOfField[i].x == xx/initialParameters['cellSize']+1) && (coordsOfField[i].y == yy/initialParameters['cellSize']+1)){
            return i;
        }
    }
};
function ruy(begin,pos,num,compPar,coordsObj){ //проверяет в зависимости от расположения корабля - может ли он занимать ту или иную позицию
    let stringRow;
    let stringCell;
    let obj;
    if(!coordsObj){
        obj = coordsOfField;
    } else {
        obj = coordsObj;
    }
    if(!compPar){
        stringRow = 'humansRow';
        stringCell = 'humansCell';
    } else {
        stringRow = 'compsRow';
        stringCell = 'compsCell';
    }
    let row = document.getElementsByClassName(stringRow);
    if(!begin){
        return false;
    }
    if(pos == 'vertical' && (obj[begin].y-1)*initialParameters['cellSize']+initialParameters['cellSize']*num <= initialParameters['cellCount']*initialParameters['cellSize']){
        for(let i = -1; i < num + 1; i++){
            for(let j = -1; j < 2; j++){
                if(!row[obj[begin].y - 1 + i]){ //проверяет есть ли вообще такая строка по y
                    continue;
                }
                if(!row[obj[begin].y - 1 + i].getElementsByClassName(stringCell)[obj[begin].x - 1 + j]){ //проверяет есть ли вообще такой столбец по x
                    continue;
                }
                //если такая строка и столбец существуют, то находится объект координаты
                //получаем десяток за счет номера строки и складываем с единицей за счет номера столбца
                let endCoord = (obj[begin].y + i - 1)*10 + (obj[begin].x + j);
                //проверяем занят ли этот объект
                if(obj[endCoord].accupied == true){
                    return false;
                }
            }
        }
    } else if(pos == 'horizontal' && (obj[begin].x-1)*initialParameters['cellSize'] + initialParameters['cellSize']*num <= initialParameters['cellCount']*initialParameters['cellSize']){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < num + 1; j++){
                if(!row[obj[begin].y - 1 + i]){
                    continue;
                }
                if(!row[obj[begin].y - 1 + i].getElementsByClassName(stringCell)[obj[begin].x - 1 + j]){
                    continue;
                }
                let endCoord = (obj[begin].y + i - 1)*10 + (obj[begin].x + j);
                if(obj[endCoord].accupied == true){
                    return false;
                }
            }
        }
    } else {
        return false;
    }
    return true;
};
function setAccupied(l,num,pos,bool,coordsObj){ //функция,которая меняет значение свойства координаты с "занятого" на "свободный" и наоборот
    let plus;
    let obj;
    if(!coordsObj){
        obj = coordsOfField;
    } else {
        obj = coordsObj;
    }
    if(pos == 'vertical'){
        plus = 10;
    } else {
        plus = 1;
    }
    for(let i = 0; i < num; i++){
        obj[l].accupied = bool;
        l+=plus;
    }
};
//отрисовка полей дивами
function fieldDrawing(field,nameRow,nameCell){
    let n = 1;
    for(let yy = 0; yy < initialParameters['cellCount']; yy++){
        let row = document.createElement('div');
        field.appendChild(row);
        row.classList.add('row');
        row.classList.add(nameRow);
        for(let xx = 0; xx < initialParameters['cellCount']; xx++){
            let elem = document.createElement('div');
            elem.classList.add(nameCell);
            elem.classList.add('cell');
            row.appendChild(elem);
            n++;
        }
    }
};
//создание объектов координат полей
function setCoordsObject(coordsObj){
    let n = 1;
    for(let yy = 1; yy < initialParameters['cellCount']+1; yy++){
        for(let xx = 1; xx < initialParameters['cellCount']+1; xx++){
            coordsObj[n] = {};
            coordsObj[n].x = xx;
            coordsObj[n].y = yy;
            coordsObj[n].accupied = false;
            n++;
        }
    }
};
//создает массив координат поля и отдает его
function createArr(){
    let n = 1;
    let arrOfNumbers = [];
    for(let i = 1; i < initialParameters['cellCount'] * initialParameters['cellCount']+1; i++){
        arrOfNumbers.push(n);
        n++;
    }
    return arrOfNumbers;
}
//функция рандомного расположения кораблей по полям(пользователя или компьютера)
function random(coordsObj,coordsParent,human){
    let newArr = createArr();
    let obj = coordsObj;
    for(let i = 1; i < initialParameters['ships'].length; i++){
        for(let j = 0; j < i; j++){
            let check = false;
            let pos;
            let randCoord;
            let randPos;
            let field;
            //до той поры,пока check будет false - будет искаться координата для вставки корабля
            while(check == false){
                //пвсевдорандомится координата
                randCoord = newArr[Math.floor(Math.random() * newArr.length)];
                //псевдорандомится положение,вертикальное или горизонтальное
                randPos = (Math.floor(Math.random()*2) == 0);
                if(randPos){
                    pos = 'vertical';
                } else {
                    pos = 'horizontal';
                }
                //если корабль нормально смог встать, то цикл завершается
                if(ruy(randCoord,pos,initialParameters['ships'][i][0],coordsParent,coordsObj) && randCoord){
                    setAccupied(randCoord,initialParameters['ships'][i][0],pos,true,coordsObj);
                    check = true;
                }
            }
            //создается новый элемент
            let ship = document.createElement('div');
            ship.classList.add('ship');
            ship.classList.add('onBord');
            if(human){
                ship.classList.add('humans','classForCheck');
                field = 'fieldForHumShips';
            } else {
                field = 'fieldForCompShips';
                ship.classList.add('classForCompCheck');
            }
            getElementById(field).appendChild(ship);
            //координаты для вставки корабля за счет данных из объекта координаты
            let x = (coordsObj[randCoord].x - 1)*initialParameters['cellSize'];
            let y = (coordsObj[randCoord].y - 1)*initialParameters['cellSize'];
            //определяется высота и ширина элемента в зависимости от его положения(верт или гор)
            if(randPos){
                ship.style.width = initialParameters['cellSize'] + 'px';
                ship.style.height = initialParameters['cellSize']*initialParameters['ships'][i][0] + 'px';
                ship.setAttribute('data-direction','ver');
            } else {
                ship.style.height = initialParameters['cellSize'] + 'px';
                ship.style.width = initialParameters['cellSize']*initialParameters['ships'][i][0] + 'px';
                ship.setAttribute('data-direction','hor');
            }
            ship.style.left = x + coordsParent.left + 'px';
            ship.style.top = y + coordsParent.top + 'px';
            if(human){
                let dragShip = new Ships(ship);
                dragShip.dragEvent().dragendEvent().dragstartEvent();
            } else {
                ship.setAttribute('data-hit',initialParameters['ships'][i][0]);
            }
            //удаляется элемент массива координат
            newArr.splice(newArr.indexOf(randCoord),1);
        }
    }
};
//функция для удаления всех кораблей с поля пользователя и создания новых для расстановки
function deleteShips(){
    let humansShips = document.getElementsByClassName('humans');
    let length = humansShips.length;
    for(let i = 0; i < length; i++){
        if(!humansShips[i]){
            break;
        }
        //console.log(onBordShips[i]);
        let shipsCoords = humansShips[i].getBoundingClientRect();
        let begin = getCoordOfSheep(shipsCoords.left -10,shipsCoords.top - 10)*1;
        //console.log(begin);
        let n = check(humansShips[i])[0];
        let pos = check(humansShips[i])[1];
        setAccupied(begin,n,pos,false)
        //getElementById('fieldForShips').removeChild(onBordShips[i]);
    }
    getElementById('fieldForHumShips').innerHTML = '';
    createDragsShips();
    this.addEventListener('click',randomOnClick);
};
//функция для чистки объекта координат от расставленных кораблей
function allClearObj(obj){
    for(let i in obj){
        obj[i].accupied = false;
    }
};
//функция,выполняющая рандомную расстановку кораблей
function randomOnClick(){
    allClearObj(coordsOfField);
    getElementById('fieldOfDragsShips').innerHTML = '';
    random(coordsOfField,fieldCoords,true);
    this.removeEventListener('click',randomOnClick);
    this.addEventListener('click',deleteShips);
};
//функция,которая возвращает изначальное расположение кораблей пользователя для расстановки, в зависимости от их положения (верт или горизонтального)
function getDefaultPosition(elem){
    let numOfDecks = check(elem)[0];
    let direction;
    if(getElementById('fieldOfDragsShips').getAttribute('data-direction') == 'hor'){
        direction = 2;
    } else {
        direction = 3;
    }
    for(let i = 1; i < initialParameters['ships'].length; i++){
        if(initialParameters['ships'][i][0] == numOfDecks){
            return initialParameters['ships'][i][direction];
        }
    }
};
//функция для создания кораблей пользователя, которые он может расставить по полю
function createDragsShips(){
    for(let i = 1; i < initialParameters['ships'].length; i++){
        for(let j = 0; j < i; j++){
            let newShip = document.createElement('div');
            getElementById('fieldOfDragsShips').appendChild(newShip);
            newShip.classList.add('ship','drag','classForCheck');
            newShip.style.height = initialParameters['cellSize'] + 'px';
            newShip.style.width = initialParameters['cellSize']*initialParameters['ships'][i][0] + 'px';
            newShip.style.left = initialParameters['ships'][i][2][0] + 'px';
            newShip.style.top = initialParameters['ships'][i][2][1] + 'px';
            newShip.setAttribute('draggable','true');
            let dragsShip = new Ships(newShip);
            dragsShip.dragEvent().dragendEvent().dragstartEvent();
        }
    }
};
//функция,которая меняет расположение кораблей пользователя,которые находятся рядом с полем, по клику
function changeDirection(){
    if(getElementById('fieldOfDragsShips').getAttribute('data-direction') == 'hor'){
        getElementById('fieldOfDragsShips').setAttribute('data-direction','ver');
    } else {
        getElementById('fieldOfDragsShips').setAttribute('data-direction','hor');
    }
    let ships = document.getElementsByClassName('drag');
    for(let i = 0; i < ships.length; i++){
        let direction = getDefaultPosition(ships[i]);
        let numberOfDecks = check(ships[i]);
        if(numberOfDecks[1] == 'horizontal'){
            ships[i].style.width = initialParameters['cellSize'] + 'px';
            ships[i].style.height = initialParameters['cellSize']*numberOfDecks[0] + 'px';
        } else {
            ships[i].style.width = initialParameters['cellSize']*numberOfDecks[0] + 'px';
            ships[i].style.height = initialParameters['cellSize'] + 'px';
        }
        //console.log(direction[1]);
        ships[i].style.left = direction[0] + 'px';
        ships[i].style.top = direction[1] + 'px';
    }
};
//функция для проверки расстановки кораблей пользователя, если не все расставленны - вернет false
function checkTheField(){
    let number = 0;
    for(let i in coordsOfField){
        if(coordsOfField[i].accupied == true){
            number++;
        }
    }
    if(number != 20){
        return false;
    } else {
        return true;
    }
};
//функция для удаления возможности двигать корабли
function deleteDragStart(){
    let dragsShips = document.getElementsByClassName('ship');
    for(let i = 0; i < dragsShips.length; i++){
        dragsShips[i].ondragstart = function(){
            return false;
        }
    }
}
//функция - помощник для начала игры, чтобы корабли компа ушли на второй план
function setZIndex(){
    let dragsShips = document.getElementsByClassName('ship');
    for(let i = 0; i < dragsShips.length; i++){
        dragsShips[i].classList.add('z-index');
    }
    getElementById('field').classList.add('z-index-5');
}
//функция для проверки занятости клетки по координатам x и y
function checkAccupiedForClick(xx,yy){
    for(let i in compsCoordsOfField){
        if((compsCoordsOfField[i].x == xx/initialParameters['cellSize']+1) && (compsCoordsOfField[i].y == yy/initialParameters['cellSize']+1)){
            if(compsCoordsOfField[i].accupied == true){
                return true;
            } else {
                return false;
            }
        }
    }
};
//функция для проверки выстрела бота,если промазал - вернет false
function checkBotsHit(n){
    if(coordsOfField[n].accupied == true){
        return true;
    } else {
        return false;
    }
};
//функция, которая либо отдает рандомное число из переданного массива, либо просто рандомное число из всех свободных координат
function randomHit(arr){
    if(arr){
        return arr[Math.floor(Math.random() * arr.length)];
    }
    return arrForBotTurns[Math.floor(Math.random() * arrForBotTurns.length)]
};
//второй ход бота, заполняется массив 4 мя возможными выстрелами,если конечно эти выстрелы не будут за пределами поля, и если он уже не стрелял в это место
function nextBotsTurn(coord){
    hit = [];
    let rowArr = document.getElementsByClassName('row')[0];
    let cellArr = rowArr.getElementsByClassName('cell');
    if(!(coord+10 > 100) && (arrForBotTurns.indexOf(coord + 10) != -1)){
        hit.push(coord+10);
    }
    if(!(coord-10 < 0) && (arrForBotTurns.indexOf(coord - 10) != -1)){
        hit.push(coord-10); 
    }
    if(cellArr[coordsOfField[coord].x - 1 - 1] && (arrForBotTurns.indexOf(coord - 1) != -1)){
        hit.push(coord - 1);
    }
    if(cellArr[coordsOfField[coord].x] && (arrForBotTurns.indexOf(coord + 1) != -1)){
        hit.push(coord + 1);
    }
};
//третий ход бота - заполняется массив из двух и менее чисей, в зависимости от существования координаты для выстрела и в зависимости от того, стрелял ли бот туда ранее
function theThirdTurn(){
    theThirdHit = [];
    allHits.sort();
    //console.log(allHits[1],allHits[0]);
    let difference = allHits[1] - allHits[0];
    if(difference < 0){
        difference*=-1;
    }
    let min = allHits[0];
    let max = allHits[allHits.length-1];
    let rowArr = document.getElementsByClassName('row')[0];
    let cellArr = rowArr.getElementsByClassName('cell');
    if(difference == 10){
        if(!(max+10 > 100) && (arrForBotTurns.indexOf(max + 10) != -1)){
            theThirdHit.push(max+10);
        }
        if(!(min-10 < 0) && (arrForBotTurns.indexOf(min - 10) != -1)){
            theThirdHit.push(min-10);
        }
    } else {
        if(cellArr[coordsOfField[min].x - 1 - 1] && (arrForBotTurns.indexOf(min - 1) != -1)){
            theThirdHit.push(min - 1);
        }
        if(cellArr[coordsOfField[max].x] && (arrForBotTurns.indexOf(max + 1) != -1)){
            theThirdHit.push(max + 1);
        }
    }
};
//функция для обновления переменных-помощников для реализации ходов бота
function targetNewShip(){
    hit = [];
    allHits = [];
    theThirdHit = [];
    theFirstHit = 0;
    sizeOfTargetShip = 0;
    humansShips--;
    checkWin();
};
//функция для заполнения координат вокруг потонувшего корабля точками, работает функция как для пользователя,так и для компа
function sunkShip(obj,classStroke,dir,len,beg){
    let length;
    let begin;
    let pos;
    let condition;
    //если послан объект с координатами пользователя,переменные возьмут значения действий бота
    if(obj == coordsOfField){
        allHits.sort();
        length = allHits.length; //длина корабля - массив из всех выстрелов по кораблю(эта функция срабатывает только после уничтожения корабля)
        begin = allHits[0]; //начальная клетка корабля
        condition = '(arrForBotTurns.indexOf(endCoord) != -1) && obj[endCoord].accupied == false'; //условие для проверки существования координаты, стреляли ли в нее уже, и не занята ли она
        if(allHits[1] - allHits[0] == 10){ //проверяется позиция корабля
            pos = 'vertical'; 
        } else {
            pos = 'horizontal';
        }
    } else { //переменные для пользователя, которые он сам посылает
        length = len;
        begin = beg*1;
        pos = dir;
        condition = 'obj[endCoord].accupied == false';
    }
    let rowClass = document.getElementsByClassName(classStroke);
    if(pos == 'vertical'){
        for(let i = -1; i < length + 1; i++){ //проверка идет по координатам сверху вниз вдоль длины корабля
            for(let j = -1; j < 2; j++){
                if(!rowClass[obj[begin].y - 1 + i]){ //проверка на существование такой строки(чтоб не вышло за пределы поля)
                    continue;
                }
                if(!rowClass[obj[begin].y - 1 + i].getElementsByClassName('cell')[obj[begin].x - 1 + j]){ //проверка на существование такой клетки(чтоб не вышло за пределы поля)
                    continue;
                }
                //конечная координата будет складываться из десятков и единиц, десятки - это номер строки,единицы - номер клетки в этой строке
                let endCoord = (obj[begin].y + i - 1)*10 + (obj[begin].x + j);
                if(eval(condition)){
                    rowClass[obj[begin].y - 1 + i].getElementsByClassName('cell')[obj[begin].x - 1 + j].style.backgroundImage = 'url(point.PNG)';
                    if(obj == coordsOfField){
                        arrForBotTurns.splice(arrForBotTurns.indexOf(endCoord),1);
                    }
                }
            }
        }
    } else if(pos == 'horizontal'){
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < length + 1; j++){
                if(!rowClass[obj[begin].y - 1 + i]){
                    continue;
                }
                if(!rowClass[obj[begin].y - 1 + i].getElementsByClassName('cell')[obj[begin].x - 1 + j]){
                    continue;
                }
                let endCoord = (obj[begin].y + i - 1)*10 + (obj[begin].x + j);
                if(eval(condition)){
                    rowClass[obj[begin].y - 1 + i].getElementsByClassName('cell')[obj[begin].x - 1 + j].style.backgroundImage = 'url(point.PNG)';
                    if(obj == coordsOfField){
                        arrForBotTurns.splice(arrForBotTurns.indexOf(endCoord),1);
                    }
                }
            }
        }
    }
};
//действия бота
function botTurn(coord){
    let humansRow = document.getElementsByClassName('humansRow');
    let randCoord;
    //первое его действие - рандом по всем свободным координатам массива arrForBotTurns
    function op(){
        randCoord = randomHit();//рандомится
        arrForBotTurns.splice(arrForBotTurns.indexOf(randCoord),1);//удаляется из этого массива зарандомленная координата(чтобы в будущем не попадалась больше,так как она будет уже занята либо точкой,либо крестиком)
        if(checkBotsHit(randCoord)){ //если попал - окрашивается в крестик,записывается первая координата попадания по кораблю, который теперь на крючке у бота
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(cross.PNG)';
            theFirstHit = randCoord;
            damagedShip(); //записывается длина корабля
            allHits.push(randCoord); //записывается эта координата в массив всех попаданий корабля, по которому теперь будет работать бот
            sizeOfTargetShip--;//убирается одна палуба из набора попаданий по кораблю
            if(sizeOfTargetShip == 0){ //если все палубы поражены - вокруг корабля появятся точки и выберется новый корабль для нападения(начнется все заново)
                sunkShip(coordsOfField,'humansRow');
                targetNewShip();
            } else { //если же нет - начнется второй этап нападения на корабль
                nextBotsTurn(randCoord); 
            }
        } else { //если же не попал по кораблю - окрасится клетка в точку и действия бота на этот ход закончатся
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(point.PNG)';
            return;
        }
        botTurn(randCoord); //функция вызовется заново для продолжения работы по кораблю
    };
    if(hit.length > 0){ //если до этого один раз попал - начнет искать вторую палубу вокруг первой палубы
        randCoord = randomHit(hit);
        arrForBotTurns.splice(arrForBotTurns.indexOf(randCoord),1);
        hit.splice(hit.indexOf(randCoord),1); //удаляется из массива этих 4(и меньше) попаданий для того, чтобы если не попал в этот раз - в след раз искал средь 3(и меньше) координат для возможной атаки
        if(checkBotsHit(randCoord)){
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(cross.PNG)';
            allHits.push(randCoord);
            hit = []; //если попал - второй этап действий бота заверешен,массив не нужен
            sizeOfTargetShip--;
            if(sizeOfTargetShip == 0){ //если убил - опять ищем новый корабль
                sunkShip(coordsOfField,'humansRow');
                targetNewShip();
            } else { //если же нет - начнется третий этап действий бота
                theThirdTurn();
            }
            botTurn();
        } else {
            //alert('no');
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(point.PNG)';
            return;
        } 
    } else if(theThirdHit.length > 0){ //рандомится средь 2 возможных направлений(может быть и 1 координата)
        randCoord = randomHit(theThirdHit);
        arrForBotTurns.splice(arrForBotTurns.indexOf(randCoord),1);
        theThirdHit.splice(theThirdHit.indexOf(randCoord),1);
        if(checkBotsHit(randCoord)){
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(cross.PNG)';
            allHits.push(randCoord);
            sizeOfTargetShip--; //если попал и еще не убил(4ех палубник) - данный этап повторится вновь
            if(sizeOfTargetShip == 0){
                sunkShip(coordsOfField,'humansRow');
                targetNewShip();
            } else {
                theThirdTurn();
            }
            botTurn();
        } else { 
            humansRow[coordsOfField[randCoord].y-1].getElementsByClassName('humansCell')[coordsOfField[randCoord].x-1].style.backgroundImage = 'url(point.PNG)';
            return;
        } 
    } else { //если до этого корабль был потоплен или бот промазал - просто будет рандом средь всех свободных координат
        op();          
    }
};
//функция для создания объекта расположения корабля по координатам,пользователю еще отдельно пишет длину
function setClassForCells(obj,classStroke,coordOfField){
    let classForCheck = document.getElementsByClassName(classStroke);
    for(let i = 0; i < classForCheck.length; i++){
        let lengthOfShip = check(classForCheck[i]);
        let l;
        if(lengthOfShip[1] == 'horizontal'){
            l = 1;
        } else {
            l = 10;
        }
        obj[i] = [];
        let helper = true;
        let coords = classForCheck[i].getBoundingClientRect();
        let xx = coords.left - coordOfField.left;
        let yy = coords.top - coordOfField.top;
        let begin = getCoordOfSheep(xx,yy)*1;
        if(classStroke == 'classForCompCheck'){
            obj[i][0] = [];
            obj[i][0].push(begin);
            for(let j = 1; j < lengthOfShip[0]; j++){
                obj[i][0].push(begin + l*j);
            }
            obj[i][1] = obj[i][0].length;
        } else {
            obj[i].push(begin)
            for(let j = 1; j < lengthOfShip[0]; j++){
                obj[i].push(begin + l*j);
            }
        }
    }
};
//функция для определения длины корабля,по которому попал бот
function damagedShip(){
    for(let i in objForShips){
        for(let j = 0; j < objForShips[i].length; j++){
            if(objForShips[i][j] == theFirstHit){
                sizeOfTargetShip = objForShips[i].length;
            }
        }
    }
};
//возвращает номер координаты в зависимости от его местоположения
function checkHumansTurns(xx,yy){
    for(let i in compsCoordsOfField){
        if((compsCoordsOfField[i].x == xx/initialParameters['cellSize']+1) && (compsCoordsOfField[i].y == yy/initialParameters['cellSize']+1)){
            return i*1;
        }
    }
};
//проверяет на разрушение корабля бота,функция нужна для дальнейшего обвода точками вокруг утонувшего судна
function checkShipForDestroy(xx,yy){
    let numberOfShip;
    let classForCheck = document.getElementsByClassName('classForCompCheck'); 
    console.log(classForCheck.length);
    for(let i = 0; i < classForCheck.length; i++){
        let coordsShip = classForCheck[i].getBoundingClientRect();
        let coordsShipLeft = coordsShip.left - compsFieldCoords.left;
        let coordsShipTop = coordsShip.top - compsFieldCoords.top;
        let coordsShipRight = coordsShip.right - compsFieldCoords.left - 2;
        let coordsShipBottom = coordsShip.bottom - compsFieldCoords.top - 2;
        if((xx+5 > coordsShipLeft && xx-5 < coordsShipRight) && (yy+5 > coordsShipTop && yy-5 < coordsShipBottom)){
            let posArr = check(classForCheck[i]);
            let begin = getCoordOfSheep(coordsShipLeft,coordsShipTop);
            classForCheck[i].style.backgroundColor = 'blue';
            classForCheck[i].dataset.hit--;
            if(classForCheck[i].dataset.hit == 0){
                sunkShip(compsCoordsOfField,'invisRow',posArr[1],posArr[0],begin);
                alert('Убит');
                compsShips--;
            }
        }
    }
};
//условия победы пользователя и компа
function checkWin(){
    if(humansShips == 0){
        alert('Вы проиграли!');
        getElementById('startOver').addEventListener('click',startOver);
        getElementById('setInvisForField').removeEventListener('click',humansTurn);
    } else if(compsShips == 0){
        alert('Вы выйграли!');
        getElementById('startOver').addEventListener('click',startOver);
        getElementById('setInvisForField').removeEventListener('click',humansTurn);
    }
};
//функция для очистки поля от точек и крестиков
function clearCells(cellClass){
    let cells = document.getElementsByClassName(cellClass);
    for(let i = 0; i < cells.length; i++){
        cells[i].style.backgroundImage = '';
    }
};
//функция для начала новой игры
function startOver(){
    allClearObj(coordsOfField);
    allClearObj(compsCoordsOfField);
    clearCells('invisCell');
    clearCells('humansCell');
    getElementById('fieldOfDragsShips').innerHTML = '';
    getElementById('fieldForHumShips').innerHTML = '';
    getElementById('fieldForCompShips').innerHTML = '';
    arrForBotTurns = createArr();
    createDragsShips();
    getElementById('startTheGame').addEventListener('click',startTheGame);
    getElementById('startOver').removeEventListener('click',startOver);
    getElementById('setInvisForField').removeEventListener('click',humansTurn);
};
//функция ходов пользователя
function humansTurn(){
    if(event.target.id == 'setInvisForField' || event.target.classList.contains('invisRow')){ //нужно для предотващение бага
        return;
    }
    let coords = event.target.getBoundingClientRect();
    let xx = coords.left - compsFieldCoords.left - 1;
    let yy = coords.top - compsFieldCoords.top -1;
    if(checkAccupiedForClick(xx,yy) && event.target.style.backgroundImage != 'url("cross.PNG")'){
        event.target.style.backgroundImage = 'url(cross.PNG)';
        checkShipForDestroy(xx,yy);
        checkWin();
    } else if(!checkAccupiedForClick(xx,yy)){
        event.target.style.backgroundImage = 'url(point.PNG)';
        botTurn();
    } else {
         botTurn();
    }
}
//функция начала игры
function startTheGame(){
    if(!checkTheField()){
        alert('Расставьте все корабли!');
        return;
    }
    //количество кораблей
    humansShips = 10;
    compsShips = 10;
    deleteDragStart();
    random(compsCoordsOfField,compsFieldCoords,false);
    setZIndex();
    setClassForCells(objForShips,'classForCheck',fieldCoords);
    setClassForCells(objForComsShips,'classForCompCheck',compsFieldCoords);
    getElementById('setInvisForField').addEventListener('click',humansTurn);
    getElementById('startTheGame').removeEventListener('click',startTheGame);
};
createDragsShips();
getElementById('changeDirection').addEventListener('click',changeDirection);
getElementById('random').addEventListener('click',randomOnClick);
getElementById('startTheGame').addEventListener('click',startTheGame);