---
layout: post
title: "Windows Azure Shared Access Signature简介"
date: 2013-12-29 22:26
comments: true
categories: azure
keywords: azure, sas, shared access signature
description: Windows Azure Shared Access Signature Introduce
---
##What
Shared Access Signature(SAS),共享访问签名，是用于提供对Windows Azure Storage中的Container，Blob，Table以及Queue在特定时间范围内进行有限权限访问的URL。

##Why
通常情况下，对Azure Storage的访问是通过账户名和密钥来实现的，这样的认证方式赋予了使用者包括增删改在内的最大的访问权限，而实际应用当中，有许多场景是希望能够限定用户的权限的，比方常见的只读权限，并且也不希望将密钥泄露给用户，这样存在很大的安全隐患。使用SAS可以很好的解决这个问题。

##How
###功能介绍
SAS提供的功能包括
#####For Blob  
	+ 读写Blob及其属性和元数据
	+ 删除、租赁和创建 Blob 快照
	+ 读取Container的Blob列表

#####For Table  
	+ 增、删、改、查（version>='2012-02-12'）

#####For Queue  
	+ 增删改队列消息（version>='2012-02-12'）
	+ 读取队列元数据，消息计数（version>='2012-02-12'）

###表现形式
一个典型的SAS（以Blob为例）为如下形式
	https://myaccount.blob.core.windows.net/sascontainer/sasblob.txt?sv=2012-02-12&st=2013-04-29T22%3A18%3A26Z&se=2013-04-30T02%3A23%3A26Z&sr=b&sp=rw&sig=Z%2FRHIX5Xcg0Mq2rqI3OlWTjEg2tYkboXr1P9ZUXDtkk%3D
由以下几部分组成  
	1. Blob URL
		> https://myaccount.blob.core.windows.net/sascontainer/sasblob.txt
		> Blob文件的网络路径
	2. Storage Service Version(sv)
		> sv=2012-02-12
		> 这是在2012-02-12版本后新加的一个参数，用来标识Storage Service所使用的版本
	3. Start Time（st)
		> st=2013-04-29T22%3A18%3A26Z
		> 采用[ISO8061][ISO8061]格式表示的日期，用来标识该SAS生效的起始时间，可以省略（注意，不是为空，表示立即生效)。
		> 官方文档上说采用的是ISO8061格式，我查了半天没找到[ISO8061][ISO8061],只有[ISO8601][ISO8601]，API产生的字符串是符合ISO8601的规范的，这里很有可能是[ISO8601][ISO8601]才对。
		> 附上[官方文档][part1]原文
		>> Specified in an ISO 8061 format. If you want the SAS to be valid immediately, omit the start time.
	4. Expiry Time(et)
		> se=2013-04-30T02%3A23%3A26Z
		> 采用[ISO8061][ISO8061]格式(疑问同上)表示的日期，用来标识该SAS失效时间，这个参数是必须的
		> 注意，在2012-02-12以前的版本中，SAS默认的有效时长最长1小时，也就是说即便你设定的st和se之间的差值为大于一小时的任何时长，该SAS还是会在1小时后自动失效
	5. Resource(sr)
		> sr=b
		> 表明该资源是一个Blob
	6. Permissions(sp)
		> sp=rw
		> 该SAS链接拥有的权限，这里是读和写
	7. Signature(sig)
		> sig=Z%2FRHIX5Xcg0Mq2rqI3OlWTjEg2tYkboXr1P9ZUXDtkk%3D
		> 用于验证对Blob访问的签名
[ISO8601]:http://en.wikipedia.org/wiki/ISO_8601
[ISO8061]:http://www.google.com.hk/#newwindow=1&q=ISO+8061&safe=strict
[part1]:http://www.windowsazure.com/en-us/manage/services/storage/net/shared-access-signature-part-1/
[part2]:http://www.windowsazure.com/en-us/manage/services/storage/net/shared-access-signature-part-2/

###SAS与SAP
可以通过两种方式来创建共享访问签名:  
1.	独立的SAS（Ad Hoc SAS),这个没什么好说的，前面已经做了很多介绍，后面会有代码演示如何创建。
2.	引用SAP（Shared Access Policy，共享访问策略）的SAS，这里需要先介绍下什么是SAP，SAP的组成形式和SAS是一样的，不同的是SAP是定义在容器，也就是Container、Queue以及Table，级别上的，SAP需要有一个名称，也可以随时被删除（即便Expiry Time还没有到），删除即失效。

###失效  
使用SAS的一个关键问题就是何时失效，上面已经有了这方面的介绍，这里做个小结  
1.	SAS指定的失效时间到了
2.	SAS引用的SAP的失效时间到了，有两种情况可以导致SAP失效时间到，一是SAP指定的失效时间过了，二是管理员更改了SAP的设定，使其失效时间指向了一个已经过去的时间（这是回收SAP的一种方式）。
3.	SAS引用的SAP被删除了（这是回收SAP的另外一种方式），高度注意，如果你删掉了一个未过期的SAP，同时创建了另一个同名的有效（未过期）SAP，那么所有引用了该SAP的SAS会继续生效（注意，此时原继承的过期时间仍然未到），所以为避免发生未预期的错误，需要注意用不同的名字创建SAP
4.	创建SAS的账号密钥被重置，这种情况下，所有使用该密钥创建的SAP，SAS都会失效，慎用

###使用  
下面用代码片段讲解一下如何使用SAS，Window Aure提供了丰富的API来帮助我们实现该功能，这里以.Net平台，C#语言为例

---
**<center>——未完待续中——</center>**
