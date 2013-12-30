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

<!--more-->

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

+ 增、删、改、查(version>='2012-02-12'可用)

#####For Queue  

+ 增删改队列消息(version>='2012-02-12'可用)
+ 读取队列元数据，消息计数(version>='2012-02-12'可用)

###表现形式
一个典型的SAS(以Blob为例)为如下形式
	https://demostorage.blob.core.chinacloudapi.cn/normal/sasdemo.txt?sv=2013-08-15&sr=b&sig=JqcAqJxPDYn37QU68Xs8dBu0PsoT%2FpkkOE7ShHRstWI%3D&st=2013-12-30T03%3A20%3A05Z&se=2013-12-30T04%3A43%3A25Z&sp=rwd
由以下几部分组成  

1. Blob URL
		
		https://demostorage.blob.core.chinacloudapi.cn/normal/sasdemo.txt
Blob文件的网络路径
2. Storage Service Version

		sv=2013-08-15
这是在2012-02-12版本后新加的一个参数，用来标识Storage Service所使用的版本
3. Start Time

		st=2013-12-30T03%3A20%3A05Z
采用[ISO8061][ISO8061]格式表示的日期，用来标识该SAS生效的起始时间，可以省略（注意，不是为空，表示立即生效)。
官方文档上说采用的是[ISO8061][ISO8061]格式，我查了半天没找到[ISO8061][ISO8061],只有[ISO8601][ISO8601]，API产生的字符串是符合[ISO8601][ISO8601]的规范的，这里很有可能是[ISO8601][ISO8601]才对。
附上[官方文档][part1]原文
	> Specified in an ISO 8061 format. If you want the SAS to be valid immediately, omit the start time.
4. Expiry Time
	
		se=2013-12-30T04%3A43%3A25Z
采用[ISO8061][ISO8061]格式(疑问同上)表示的日期，用来标识该SAS失效时间，这个参数是必须的
注意，在2012-02-12以前的版本中，SAS默认的有效时长最长1小时，也就是说即便你设定的st和se之间的差值为大于一小时的任何时长，该SAS还是会在1小时后自动失效
5. Resource
	
		sr=b
表明该资源是一个Blob
6. Permissions
		
		sp=rwd
该SAS链接拥有的权限，这里是读、写和删除。
7. Signature
		
		sig=JqcAqJxPDYn37QU68Xs8dBu0PsoT%2FpkkOE7ShHRstWI%3D
用于验证对Blob访问的签名
[ISO8601]:http://en.wikipedia.org/wiki/ISO_8601
[ISO8061]:http://www.google.com.hk/#newwindow=1&q=ISO+8061&safe=strict
[part1]:http://www.windowsazure.com/en-us/manage/services/storage/net/shared-access-signature-part-1/
[part2]:http://www.windowsazure.com/en-us/manage/services/storage/net/shared-access-signature-part-2/

<!--stop list-->
###SAS与SAP
可以通过两种方式来创建共享访问签名:  

+ 独立的SAS（Ad Hoc SAS)  
这个没什么好说的，前面已经做了很多介绍，后面会有代码演示如何创建。
+ 引用SAP（Shared Access Policy，共享访问策略）的SAS  
这里需要先介绍下什么是SAP，SAP的组成形式和SAS是一样的，不同的是SAP是定义在容器，也就是Container、Queue以及Table，级别上的，SAP需要有一个名称，也可以随时被删除（即便Expiry Time还没有到），删除即失效。

###失效  
使用SAS的一个关键问题就是何时失效，上面已经有了这方面的介绍，这里做个小结  

+ SAS指定的失效时间到了
+ SAS引用的SAP的失效时间到了  
有两种情况可以导致SAP失效时间到，一是SAP指定的失效时间过了，二是管理员更改了SAP的设定，使其失效时间指向了一个已经过去的时间（这是回收SAP的一种方式）。
+ SAS引用的SAP被删除了  
这是回收SAP的另外一种方式，**如果你删掉了一个未过期的SAP，之后又创建了另一个同名的有效（未过期）SAP，那么所有引用了该SAP的SAS会继续生效**（注意，此时原继承的过期时间仍然未到），所以为避免发生未预期的错误，需要注意用不同的名字创建SAP
+ 创建SAS的账号密钥被重置  
这种情况下，所有使用该密钥创建的SAP，SAS都会失效。**慎用**

###使用  
下面用代码片段讲解一下如何使用SAS，Window Aure提供了丰富的API来帮助我们实现该功能，这里以.Net平台，C#语言为例

####Ad hoc SAS
SAS可以创建在Container上

``` c# 为Container创建SAS
public string GenerateContainerSasUri(string containerName, DateTime? startTime, DateTime expiryTime, SharedAccessBlobPermissions permission)
{
    SharedAccessBlobPolicy sasConstraints = new SharedAccessBlobPolicy();
    sasConstraints.SharedAccessStartTime = startTime;
    sasConstraints.SharedAccessExpiryTime = expiryTime;
    sasConstraints.Permissions = permission;
    CloudBlobContainer container = GetContainer(containerName);
    var sas = container.GetSharedAccessSignature(sasConstraints);
    return container.Uri + sas;
}

```
也可以创建在Blob上
``` c# 为Blob创建SAS
public string GenerateBlobSasUri(string containerName, string blobName, DateTime? startTime, DateTime expiryTime, SharedAccessBlobPermissions permission)
{
    CloudBlobContainer container = GetContainer(containerName);
    CloudBlockBlob blob = container.GetBlockBlobReference(blobName);
    SharedAccessBlobPolicy sasConstraints = new SharedAccessBlobPolicy();
    sasConstraints.SharedAccessStartTime = startTime;
    sasConstraints.SharedAccessExpiryTime = expiryTime;
    sasConstraints.Permissions = permission;

    string sas = blob.GetSharedAccessSignature(sasConstraints);
    return blob.Uri + sas;
}
```

那么调用
	signature = GenerateContainerSasUri(containerName,startTime, endTime, SharedAccessBlobPermissions.Read | SharedAccessBlobPermissions.Write);

或者调用
    signature = provider.GenerateBlobSasUri(containerName, blobName, startTime, endTime, SharedAccessBlobPermissions.Read | SharedAccessBlobPermissions.Write);

返回的结果就是形如我们上面提到的典型SAS的一个URL
	https://demostorage.blob.core.chinacloudapi.cn/normal/sasdemo.txt?sv=2013-08-15&sr=b&sig=JqcAqJxPDYn37QU68Xs8dBu0PsoT%2FpkkOE7ShHRstWI%3D&st=2013-12-30T03%3A20%3A05Z&se=2013-12-30T04%3A43%3A25Z&sp=rwd

基于SAP的SAS的创建方法略有不同，我们需要首先创建一个SAP，注意，SAP是只能创建在容器(Container,Table,Queue)上的，并且可以随时删除。这里仍然以Container为例。
``` c# 为Container创建SAP
//没有返回值
public void SetContainerSap(string containerName, string policyName, DateTime? startTime, DateTime expiryTime, SharedAccessBlobPermissions permission)
{
    CloudBlobContainer container = GetContainer(containerName);
    SharedAccessBlobPolicy sharedPolicy = new SharedAccessBlobPolicy()
    {
        SharedAccessStartTime = startTime,
        SharedAccessExpiryTime = expiryTime,
        Permissions = permission
    };
    BlobContainerPermissions permissions = new BlobContainerPermissions();
    permissions.SharedAccessPolicies.Clear();
    permissions.SharedAccessPolicies.Add(policyName, sharedPolicy);//SAP需要一个Name
    container.SetPermissions(permissions);
}
```
``` c# 删除SAP
public void RemoveContainerSap(string containerName, string policyName)
{
    CloudBlobContainer container = GetContainer(containerName);
    BlobContainerPermissions permissions = container.GetPermissions();
    permissions.SharedAccessPolicies.Remove(policyName);
    container.SetPermissions(permissions);
}

```
如果我们需要创建一个基于SAP的SAS就可以这样子来做

``` c# 为Blob创建基于SAP的SAS
public string GenerateBlobSasUri(string containerName, string blobName,string policyName)
{
    CloudBlobContainer container = GetContainer(containerName);
    CloudBlockBlob blob = container.GetBlockBlobReference(blobName);
    //这里我们没有传入policy参数，只是指定了一个SAP的名称(policyName),这样SAS会继承SAP的设定
    string sas = blob.GetSharedAccessSignature(null,policyName);
    return blob.Uri + sas;
}
```
为Container创建基于SAP的SAS方法是类似的，留给大家自己练习。

---
**<center>——未完待续中——</center>**
