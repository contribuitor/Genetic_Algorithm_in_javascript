POOL_SIZE = 40;
GENE_LEN = 5;
CROSSRATE = 0.7;
MUTARATE = 0.001;
var TARGET = document.getElementById("myNumber").value;
Generation = 0;

var genes = new Array;
var newGenes = new Array;
	
var geneTable = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/'];

/*****************************主函数****************************/
function doIt(){
	var towGenes = new Array;
	initGenePools();
	//Generation = 0;
	//alert(typeof(genes[1]));
	for(var i=0; i<10000; i++){
		twoGenes = [selectMember(genes), selectMember(genes)];
		//alert(twoGenes + ": genes before corssover");
		twoGenes = crossover(twoGenes[0],twoGenes[1]);//alert(twoGenes);
		//alert(twoGenes + ": genes after corssover");
		twoGenes = mutate(twoGenes);
		//alert(twoGenes + ": genes after mutate");
		fitness(decode(twoGenes[0]));
		fitness(decode(twoGenes[1]));
		newGenes.push(twoGenes[0]);
		newGenes.push(twoGenes[1]);
		if(newGenes.length >= POOL_SIZE){
			genes = newGenes;
			newGenes = [];	
			Generation += 1;
			document.getElementById("info").innerHTML += Generation + " ";
			//alert(genes);
		}
	}
}

//alert(decode("01100001101010000011"));

/*****************************工具函数****************************/
//初始化基因库
function initGenePools() {
	genes = new Array(POOL_SIZE);
	for (var i=0; i<POOL_SIZE; i++) {
		genes[i] = new String;
		for(var j=0; j<GENE_LEN*4; j++){
			genes[i] += Math.round(Math.random()).toString();
		}
		
	}
	//newGenes = genes;
	//alert(parseInt(genes[1], 2));
}

//解码基因,输入基因String 输出对应合法的expression的值
function decode(gene) {
	//alert("going to decode:  " + gene);
	//if(typeof(gene) == "object") {alert("going to decode:  " + gene + ". typeof it is :　　" + typeof(gene));}
	var expression = new String;
	for (var i=0; i<GENE_LEN*4; i+=4) {
		var num = parseInt( gene.toString().substr(i, 4), 2 );//二进制编码变十进制的数
		//alert(num);
		//expression 必须有“数字->算符->数字->算符->...”这种形式 
		if(expression.length % 2 == 0 && num <=9) expression += geneTable[num];
		else if (expression.length % 2 == 1 && num > 9 && num <= 13) expression += geneTable[num];
	}
	if(expression.length % 2 ==0) expression = expression.substr(0, expression.length - 1);
	
	return expression;
}

//alert(decode("10111010110010001100"));

//计算gene的fitness，输入一个expression（String 类型），输出它的fitness
function fitness(expression){
	var tot = parseInt(expression[0]);
	var operater = "";	
	for(var i=1; i<expression.length; i++) {
		//偶数位为算符，奇数位是数
		if(i%2 == 1) operater = expression[i];
		else {
			switch(operater){
				case("+"): tot += parseInt(expression[i]); break;
				case("-"): tot -= parseInt(expression[i]); break;
				case("*"): tot *= parseInt(expression[i]); break;
				case("/"): tot /= parseInt(expression[i]); break;
			}
		}
	}
	//document.getElementById("info").innerHTML += "generation + 1; ";
	//alert("the value of the expression is: " + tot);
	if(TARGET - tot == 0) {
		document.getElementById("info").innerHTML +="Expression is:  " + expression;
		document.getElementById("info").innerHTML += ".  Generation: " + Generation;
		//alert(Generation);
		exit();
	}
	else if(isNaN(tot)) return 0;  //返回一个很小的fitness
	else return 1.0/Math.abs(TARGET - tot);  //表达式的值越接近，fitness值越大！！
}

//alert("fitness is:  " + fitness("9+9/3"));

//根据概率选出一条基因，并将该基因从库中删除！输入genes库（数组），输出genes（string）
/****算法：把数组元素值求和（记为S），那么生成一个0-S之间的均匀分布随机数P，然后从头到尾遍历数组，并在每步迭代中用P与数组当前位置i的累加值Si进行比较，就可以找到所需的数组元素。*****/
function selectMember(genes){
	var length = genes.length;	
	var fitnesses = new Array(length);//用来保存fitnesses	的数组
	for (var i=0; i<length; i++) {
		fitnesses[i] = fitness(decode(genes[i])); //计算第i条gene的fitness
	}
	var tot = 0.0; //fitnesses 总和
	for (var j=0; j<length; j++) {
		tot += fitnesses[j];
	}
	
	var place = Math.random() * tot;
	var tot2 = 0.0;
	var genePlace = 0;
	for (var k = 0; k < length; k++) {
		tot2 += fitnesses[k];
		if(tot2 >= place ) {
			genePlace = k;
			break;
		}	
	}
	return genes.splice(genePlace,1);
}

 
/* initGenePools();
alert(selectMember(genes)); */


//输入两条基因，对其进行crossover
function crossover(gene1, gene2){
	var length = gene1.length;
	if(Math.random() <= CROSSRATE) {
		var node = Math.round(Math.random() * (length -1));
		var temp = gene1.slice(node+1);
		//gene2.splice(node,length - node - 1,temp);
		gene1 = gene1.slice(0,node+1) + gene2.slice(node+1);
		gene2 = gene2.slice(0,node+1) + temp;
	}
	//alert(twoGenes);
	return [gene1, gene2];
}

/* a = ["1111111111","0000000000"];
a = crossover(a[0],a[1]);
alert(a); */
/* var a = ["00000000","11111111"];
for(var i=0; i<10; i++){
	a = crossover(a);
	alert(a);
}  */

//对两条基因进行突变
function mutate(twoGenes){
	var length = twoGenes[0].toString.length;
	for(var i=0; i<length; i++) {
		if(Math.random() <= MUTARATE) {
			//alert(typeof(twoGenes[0][i]));	
			if(twoGenes[0][i] == "0") twoGenes[0] = twoGenes[0].toString.substr(0, i) + "1" + twoGenes[0].toString.substr(i+1);
			else twoGenes[0] = twoGenes[0].toString.substr(0, i) + "0" + twoGenes[0].toString.substr(i+1);
		}
	}	
	for(var i=0; i<length; i++) {
		if(Math.random() <= MUTARATE) {
			//alert(typeof(twoGenes[0][i]));	
			if(twoGenes[1][i] == "0") twoGenes[1] = twoGenes[0].toString.substr(0, i) + "1" + twoGenes[1].toString.substr(i+1);
			else twoGenes[1] = twoGenes[1].toString.substr(0, i) + "0" + twoGenes[1].toString.substr(i+1);
		}
	}
	return twoGenes;
}
//alert(mutate(["1111111","1111111"]));

