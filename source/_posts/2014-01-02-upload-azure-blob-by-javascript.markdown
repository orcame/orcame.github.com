---
layout: post
title: "通过Javascript上传文件到Azure存储服务器"
date: 2014-01-02 19:32
comments: true
categories: azure
keywords: azure blob javascript cors sas
descriptions: upload azure blob by javascript
---
Azure的存储服务目前开通了跨域访问[CORS][CORS]请求功能，有了这个功能，我们就可以将被本地文件通过javascript上传到azure的存储服务器上了，而这个过程不需要任何服务器端代码就可以完成。你可以到这里看一下[演示效果](http://www.orcame.com/jquery-blobuploader/)!下面来看看怎么实现这个功能。

<!--more-->

[CORS]:http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
##准备工具

+ 支持HTML5的浏览器一枚
+ 文本编辑器一个
+ javascript打字员一名
+ 测试上传用文件若干

##准备条件

###存储服务器
经过一段时间的试用和测试，Windows Azure Storage的性能和稳定性都是非常高的，访问速度很快，这个我们可以用本次实验的结果给出证明。我选用了Azure中国(MoonCake)的存储服务，数据中心在上海。想要实现通过JS在浏览器端将文件提交到Azure Storage，需要满足以下两个条件。

1. 取得Azure Storage的访问权限
	有关这个问题，我前一篇博客已经对SAS做了比较详细的介绍，[传送门](http://www.orcame.com/blog/2013/12/29/windows-azure-sas-introduce/)。我们这里采用在Container级别上设置SAS的方式取得对Azure Storage的访问权限
2. 将Azure Storage Account设置为允许跨域请求  
	Azure Storage已经开通了跨域请求功能，详细信息请移步[这里](http://blogs.msdn.com/b/windowsazurestorage/archive/2013/11/27/windows-azure-storage-release-introducing-cors-json-minute-metrics-and-more.aspx)，默认是关闭的，要想使用这个功能，我们需要对存储账户做一些设置。不幸的是Azure Portal上找不到设置入口，你只能通过API来实现。截止目前(01/03/2014)，MoonCake平台依然不能运行Azure SDK 2.2以上版本(如果你胆敢发布一个基于SDK2.2的Cloud Service，那么MoonCake很生气，后果很严重——不但你的Cloud Service发布失败，而且你的整个Subscription的Portal页面也全挂了)，但亲测在本地运行Azure Storage SDK3.0是可以成功开启MoonCake上Storage的CORS功能的。

附上开启CORS功能的API:
```c# 为Azure Storage Account开启CORS功能
public void OpenCors()
{
	CloudStorageAccount account = CloudStorageAccount.Parse(connectionString);
	CloudBlobClient client = account.CreateCloudBlobClient();
	ServiceProperties propers = client.GetServiceProperties();
	CorsRule cr = new CorsRule();
	cr.AllowedMethods = CorsHttpMethods.Put | CorsHttpMethods.Options | CorsHttpMethods.Post | CorsHttpMethods.Delete | CorsHttpMethods.Get;
	cr.AllowedOrigins.Add("[your domain]");//http://www.orcame.com for example
	cr.AllowedHeaders.Add("*");
	cr.MaxAgeInSeconds = 200;
	propers.Cors = new CorsProperties();
	propers.Cors.CorsRules.Add(cr);
	client.SetServiceProperties(propers);
}
```
###浏览器
用javascript上传文件我们必须能够取得对本地文件的读取操作，在HTML5之前这是不被允许的，
现代浏览器为我们提供了一个崭新的javascript API，FileReader，这使得我们可以异步的读取本地文件，甚至可以将文件拆分。有关FileReader的用法，我们在接下来的代码环节进行展开。


##功能列表
本次实验我们要实现的功能如下

1. 文件上传
2. 并发控制
3. 断点续传

##实验步骤
###文件上传
根据前面的分析，想要实现一个文件上传功能，需要用到FileReader对本地文件进行读取，然后通过ajax来发起上传请求到Azure Storage服务器

对于File,FileReader类，这里不做更详细的介绍，仅仅说明一下这里需要用到的方法和事件。

+ File.slice(start,end)
	有关slice方法的详细介绍请参考[这里](http://www.w3.org/TR/FileAPI/#slice-method-algo),简单来讲，就是这个方法可以根据传入的start和end将一个文件拆分成一个块（在js中叫blob，在azure中叫block，而在azure中js中的file叫blob，我勒个去，好绕），假设我们有一个`<input type='file'/>`控件，那么当我们选定了一个文件之后，是可以通过`files[0]`取得当前文件的实例的。
+ FileReader.readAsArrayBuffer(blob)
	惯例，官方文档在[这里](http://www.w3.org/TR/FileAPI/#readAsArrayBuffer),这个方法可以将一个blob(azure中的block)读入到FileReader实例中
+ FileReader.onloadend(ev)
	[传送门](http://www.w3.org/TR/FileAPI/#event-handler-attributes-section),简单来讲这是一个事件，当上面的readAsArrayBuffer执行结束后会触发这个事件。

关于ajax请求如何发送，这里不赘述，请参考jquery[文档](http://api.jquery.com/jquery.ajax/)

在正式开始之前，我们得先明确几个概念

+ File(JS):指代本地一个文件
+ Blob(JS):指代本地文件被拆分出的一块，相当于Azure中的Block
+ Blob(Azure):一个文件，可以由无数个Block组成
+ Block:无数个Block组成一个Blob

为简单起见，本文以下内容，对于文件统称blob，块统称block

说了好多废话，现在开席，上菜了。

有了上面的介绍，一个内容上传的功能就很容易实现了，且看代码

```js 上传block代码
var sendBlock = function (block, beforeSend, progress, success, error) {
	$.ajax({
	    url: block.url,
	    type: "PUT",
	    data: block.data,
	    processData: false,
	    xhr: function () { 
	        var _xhr = $.ajaxSettings.xhr();
	        if (_xhr.upload) { 
	            _xhr.upload.addEventListener('progress', function (ev) {
	            	//这里为了获取上传进度，我们添加了progress事件，在事件中可以做一些UI上的进度显示功能
	                if (ev.lengthComputable) {
	                    if (progress) {
	                        progress.call(block,ev.loaded,ev.total)
	                    }
	                }
	            }, false);
	        }
	        return _xhr;
	    },
	    beforeSend: function (xhr) {
	    	block.status='uploading';
	        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
	        if (beforeSend) {
	        	//在上传开始之前，你可以通过这个事件做一些小动作
	            beforeSend(xhr);
	        }
	    },
	    success: function (data, sta) {
	    	block.status='success';
	        if (success) {
	        	//上传成功后，用这个方法通知UI
	            success.call(block,data, status);
	        }
	    },
	    error: function (xhr, desc, err) {
	    	block.status='error';
	        if (error) {
	        	//同理，失败了用这个方法通知UI
	            error.call(block, xhr, desc, err);
	        }
	    }
	});
};
```
上面就是一个最基本的block上传功能，如果要实现一个blob的上传,我们还需要做进一步的改进。首先就需要对blob进行拆分，因为azure的storage对block的大小有个限制，最大不能超过4M，所以我们的拆分上限就是4M。
有了上面的代码片段，实现一个blob的上传就很容易了，我们可以传入success方法，在前一个block上传成功了之后继续上传下一个block，直到所有block全部上传完毕。下面仅仅给出逻辑实现：

```js 上传一个blob

var _blob;
function success=(){
	var block =this.blob.nextBlock();
	if(block){
		//在这里，我们做一个递归调用，一旦block上传完毕，就继续上传下一个block，直到所有block都完成为止。
		sendBlock(block,null,null,success,error);
	}else{
		//所有Block都上传完成了，这里需要做一个commit动作，就是通知azure storage，我刚刚上传的那些block是属于同一个blob的，请合并。
		commitBlob(this.blob);
	}
}

function error(){
	//预留占位	
}

function commitBlob(blob,success,error){
	var uri = blob.url + '&comp=blocklist'
		, data = []
		, len = blob.blocks.length;
	//blob的commit需要提供一个blockid列表，这个列表中的所有项的长度必须一致，并且顺序不能错乱
    data.push('<?xml version="1.0" encoding="utf-8"?><BlockList>');
    for (var i = 0; i < len; i++) {
        data.push('<Latest>' + blob.blocks[i].id + '</Latest>');
    }
    data.push('</BlockList>');
    $.ajax({
        url: uri,
        type: "PUT",
        data: data.join(''),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('x-ms-blob-content-type', blob.type);
        },
        success: function (data, sta) {
            if (success) {
                success(data, sta);
            }
        },
        error: function (xhr, desc, err) {
            if (error) {
                error(xhr, desc, err);
            }
        }
    });
}

var _block=_blob.nextBlock();
sendBlock(_block,null,null,success,error);//这里开始上传

```
通过上面这两段简单的代码，我们就可以实现一个文件的上传操作了。总结起来的步骤就是

1. 根据设定的blockSize从blob中取得下一个block
2. 上传block
3. 如果blob中还有block，回到1，否则到4
4. commit刚刚上传的blob

###并发控制

上面的步骤只是实现了最基本的上传功能，并且上传是单线程按序进行的，就是说一个文件同时只有一个block在上传，之后这个block上传成功了，下一个block才会开始上传。那么如果我想同时上传多个文件，并且同一个文件也可以多个block同时上传该怎么办呢？

因为在ajax的请求中，所有动作都是异步的，那么有很多事情我们需要在回调函数中才能处理，这也是为什么上面的代码对外开放了success和error两个事件回调的主要原因。

对于单个文件的上传，要支持多请求并发是比较容易实现的，可以设想一个请求计数器，初始值为我们预设的最大请求数量。设定一个循环，每发起一个请求，计数器自减1，每个请求成功了之后，同样是按照上面的规则，如果还有block，就开启一个新的请求,需要注意的是，只有所有的block全部上传成功了，我们才能进行blob的commit操作,需要对success方法做一个小改动。

```js 并发上传blob
var maxThread=20;

function blobUploadFinished(blob){
	for(var idx=0;idx<blob.blocks.length;idx++){
		if(blob.blocks[i].status!='success'){
			return false;
		}
	}
	return true;
}

function success=(){
	var blob=this.blob;
	var block =this.blob.nextBlock();
	if(block){
		//这里开启一个新的请求上传获取到的下一个block
		sendBlock(block,null,null,success,error);
	}else{
		if(blobUploadFinished(blob)){//所有block都上传成功了，再commit
			commitBlob(blob);
		}
	}
}

while(maxThread==-1 || maxThread>0){
	//maxThread = -1意味着无限定，所有block可以同时上传，强烈不建议这样做，实测400M+的文件导致chrome崩溃(电脑配置也比较烂)
	var block =_blob.nextBlock();
	if(block){		
		sendBlock(block,null,null,success,error);
	}
	if(maxThread>0){
		maxThread--;
	}
}

```
一个blob的多请求并发上传功能实现了，那么如果我想对多个blob进行处理该怎么办呢？其实原理也是一样的，还是有一个最大请求限定，只不过我们需要事先将所有的blob放入一个数组，上面的while循环就多了一步验证所有blob是否全部没有待上传block的步骤。

```js 并发上传多个blob

var blobs=[];
//push all your blob in blobs here.
function nextBlock(){
	var len = blobs.length;
	for(var idx=0;idx<len;idx++){
		var block=blobs[idx].nextBlock();
		if(block){
			return block;
		}
	}
	return null;
}
while(maxThread==-1 || maxThread>0){
	var block =nextBlock();
	if(block){		
		sendBlock(block,null,null,success,error);
	}
	if(maxThread>0){
		maxThread--;
	}
}

```

###断点续传
细心的会很快发现，我们上面的代码都是围绕着success回调方法做一些简单的改动就可以实现单线程或者并发的上传操作，那么断点续传该怎样处理呢？bingo，答对了，error回调方法可以很好的帮我们解决这个问题。
断点续传的简单思路就是将那些上传失败的block重新上传，直到所有block全部上传成功了，才结束提交blob，结束整个上传过程。

```js 一个简单error回调的实现
	
function error(){
	sendBlock(this,null,null,success,error);
}

```

这个error回调真是简单到极致了，总觉得哪里有问题，不是么？当我有多个文件需要上传，而因为某种原因，这个block总是失败怎么办？那么他走时占用一个请求，循环啊循环，永无止境。我们做个小改动试试看。

```js 改进的error回调

function error(){
	this.blob.addErrorBlock(this);
	var block=nextBlock();
	sendBlock(block,null,null,success,error);
}

```
在这段代码中，我们将失败的block加入到blob的失败列表中，接着从blob列表中获取取下一个可用的block进行上传。
这样我们就实现了简单的断点续传功能。

###补充说明
下面我们补充一下上面用到的但还没有见到长什么样子的代码。
```js 久违的blob和block
var blob = function(file,containerUrl,blockSize){
	this.file=file;
	var qidx=containerUrl.indexOf("?");
	this.blobUrl=containerUrl.substring(0, qidx) + '/' + file.name;//记录blob的链接
	this.url=this.blobUrl + containerUrl.substring(qidx);//记录blob包括sas的链接
	this.blockSize=blockSize;
	this.errorBlocks=[];
	this.blocks=[];
}
blob.prototype.nextBlock=function(){
	var file=this.file;
	if(this.pointer<file.size){
		var _block = file.slice(this.pointer,this.pointer+this.fileSize);
		this.pointer+=_block.size;
		return new block(this,_block);
	}
	return this.errorBlocks.shift();
}

blob.prototype.addErrorBlock(block){
	this.errorBlocks.push(block);
}

function padstr(num){
	var str=''+num;
	while(true){
		if(str.length<6){
			str+='0';
		}
	}
	return num;
}

var block=function(blob,fileSlice){
	this.blob=blob;
	this.data=fileSlice;
	blob.blocks.push(this);
	this.id=btoa("block-" + pad(blob.blocks.length)).replace(/=/g, 'a');
	this.url=blob.url+'&comp=block&blockid=' + block.id;
}

```

**注意**文章中的代码片段只是提供一个思路，如果您需要完整的代码，请参考我github上的一个[jquery插件](https://github.com/orcame/jquery-blobuploader)。

##测试

我写了一个简单的测试页面，截图如下：
{% img /images/image-post/blobuploader-0.png %}

添加几个文件，做个简单的测试后，得到的数据如下

文件大小|Block Size|Max Thread|最大速度|最小速度|平均速度
---|---|---|---|---|---
364M|2M|20|170M/S|54K/S|9.8M/S
693M|2M|20|290M/S|126K/S|12M/S
693M|4M|10|550M/S|59K/S|11.8M/S
1.35M|4M|10|4M/S|110K/S|680K/S

统计结果中最大速度波动比较大，这个基本都是瞬时速度，不具备什么参考价值。也有可能我统计的方式不对！


##后记

这之后有做过一些测试，这个和当前的网络情况有很大关系，每隔一段时间，测试的结果波动都非常大。后来在Azure上面建了一个虚拟机，通过走数据中心内部的网络进行测试，对于135M左右的文件，基本稳定在5s以内可以上传完毕，这个速度还是非常可观的。