POOL_SIZE = 40;
GENE_LEN = 5;

var genes,newGenes;
var geneTable = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/'];

/*****************************主函数****************************/
function doIt(){

}

/*****************************工具函数****************************/
//初始化基因库（新旧都初始化）
function initGenePools() {
	genes = new Array(POOL_SIZE);
	for (var i=0; i<POOL_SIZE; i++) {
		genes[i] = new String;
		for(var j=0; j<GENE_LEN*4; j++){
			genes[i] += Math.round(Math.random()).toString();
		}
	}
	newGenes = genes;
	//alert(parseInt(genes[1], 2));
}

//解码基因,输入基因String 输出对应合法的expression的值
function decode(gene) {
	var expression = new String;
	for (var i=0; i<GENE_LEN*4; i+=4) {
		var num = parseInt( gene.substr(i, 4), 2 );//二进制编码变十进制的数
		//alert(num);
		//expression 必须有“数字->算符->数字->算符->...”这种形式 
		if(expression.length % 2 == 0 && num <=9) expression += geneTable[num];
		else if (expression.length % 2 == 1 && num > 9) expression += geneTable[num];
	}
	return expression;
}

//alert(decode("10111010110010000111"));

//计算gene的fitness，输入一条gene（String 类型），输出它的fitness
function fitness(gene){
	
}

//根据概率选出两条基因，输入genes库（数组），输出两条genes（数组）
function selectMember(genes){
	
}

//输入两条基因，对其进行crossover
function crossover(twoGenes){
	
}

//对两条基因进行突变
function mutate(twoGenes){
	
}

