const fs = require('fs');
const path = require('path');

const bountyDir = './bounties';
const unclaimedDir = bountyDir + '/unclaimed';
const imgDir = './public/img';
const noThumbnailImage = '../no-image.png';

exports.buildDirectoriesIfNecessary = (_userId) => {
    const claimedDir = bountyDir + '/' + _userId;

    if (!fs.existsSync(imgDir))
        fs.mkdirSync(imgDir);
    if (!fs.existsSync(bountyDir))
        fs.mkdirSync(bountyDir);
    if (!fs.existsSync(unclaimedDir))
        fs.mkdirSync(unclaimedDir);
    if (!fs.existsSync(claimedDir))
        fs.mkdirSync(claimedDir);
}

getBounties = (_userId) => {
    const files = [];
    const directory = bountyDir + '/' + _userId;

    const fileNames = fs.readdirSync(directory);
    fileNames.forEach(fileName => {
        if (path.extname(fileName) == ".json") {
            const data = fs.readFileSync(directory +'/' + fileName, 'utf8');
            const bounty = JSON.parse(data);
            if(!bounty.thumbnail || bounty.thumbnail.trim() === "" || !fs.existsSync(imgDir + '/' + bounty.thumbnail))
                bounty.thumbnail = noThumbnailImage;
            bounty.title = path.parse(fileName).name;
            bounty.claimer = (_userId !== "unclaimed") ? _userId : "noone";
            files.push(bounty);
        }});

    return files;
}

exports.getAllUsers = () => {
    const allDirectories = fs.readdirSync(bountyDir, (err) => {if (err) throw err;});

    return allDirectories.filter(userId => userId !== "unclaimed");
}

exports.getAllBounties = () => {
    const bounties = [];

    fs.readdirSync(bountyDir, (err) => {if (err) throw err;})
        .forEach(userId => bounties.push(getBounties(userId)));

    return bounties.flat();
}

randomId = (_userId) => {        
    if (_userId.length == 0) return '0';
    
    let hash = 0;

    for (let j = 0; j <= 1000; j+=10) {
        hash += Math.ceil(Math.random() * j);
    }

    for (let i = 0; i < _userId.length; i++) {
        hash = ((hash << 5) - hash) + _userId.charCodeAt(i);
        hash = hash & hash;
    }
        
    return hash.toString();
}

exports.claimBounty = (_filename, _userId, _claim) => {
    const userDir = bountyDir + '/' + _userId;
    const oldFileLoc = unclaimedDir + '/' + _filename;
    const newFileLoc = userDir + '/' + _filename;

    fs.renameSync((_claim) ? oldFileLoc : newFileLoc, (_claim) ? newFileLoc : oldFileLoc, function (err) {
        if (err) throw err;
    })
}

exports.createBounty = (_files, _title, _price, _description, _specifications, _tags) => {
    let bounty = new Object();

    if (_files && _files.thumbnail) {
        bounty.thumbnail = _files.thumbnail.name;
        fs.writeFile(imgDir + '/' + _files.thumbnail.name, _files.thumbnail.data, (err) => {if(err) throw err;});
    }

    try{
        bounty.id = randomId(_title);
        bounty.price = parseInt(_price);
        bounty.description = _description;
        bounty.specifications = _specifications.split(',');
        bounty.tags = _tags.split(',');
    } catch (err) {
        throw "Bad data while creating bounty json";
    }
    
    const jsonFile = unclaimedDir + '/' + _title + '.json';
    if (!fs.existsSync(jsonFile))
        fs.writeFile(jsonFile, JSON.stringify(bounty), (err) => {if(err) throw err;});
}

exports.deleteBounty = (_filename) => {
    const allDirectories = fs.readdirSync(bountyDir, (err) => {if (err) throw err;});

    allDirectories.forEach(dir => {
        const bounties = fs.readdirSync(bountyDir + '/' + dir, (err) => {if (err) throw err;});
        bounties.forEach(bounty => {
            if(bounty === _filename) {
                const data = JSON.parse(fs.readFileSync(bountyDir + '/' + dir + '/' + _filename, 'utf8'));

                fs.unlinkSync(bountyDir + '/' + dir + '/' + bounty, (err) => {if (err) throw err;});

                if(data.thumbnail !== noThumbnailImage && fs.existsSync(imgDir + '/' + data.thumbnail))
                    fs.unlinkSync(imgDir + '/' + data.thumbnail, (err) => {if (err) throw err;});
            }
        });
    });    
}