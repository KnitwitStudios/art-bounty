const switchToggle = document.querySelector('#myBountySwitch');
const claimedRow = document.querySelector('#claimedRow');
claimedRow.style.display = "none";
const unclaimedRow = document.querySelector('#unclaimedRow');
unclaimedRow.style.display = "flex";
const allRow = document.querySelector('#allRow');
if (allRow) {allRow.style.display = "none";}
const tagSelect = document.querySelector('#tagSelect');
const rowSwitch = document.querySelector('#rowSwitch');

let editBounty = undefined;

function editMode(_bounty) {
    editBounty = _bounty;
}

function claim(_title, _userId, _claim) {
    let request = new XMLHttpRequest();
    request.open("POST", window.location.href.replace('board', 'claim'), true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("filename="+_title+".json&userId="+_userId+"&claim="+_claim.toString());

    request.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200)
          location.reload();
        else if (this.status == 501)
          { alert("Bounty has changed locations since page last loaded.\n\nRefreshing page..."); location.reload(); }
        else 
          alert("Server failed to claim bounty.\n\nPlease contact Collin for support");
      }
    };
  }

  function reclaim(_title, _oldUserId, _newUserId) {
    let request = new XMLHttpRequest();
    request.open("POST", window.location.href.replace('board', 'claim'), true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("filename="+_title+".json&userId="+_oldUserId+"&claim=false");

    request.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200)
          claim(_title, _newUserId, true); // Instead of refreshing page, claim it to the new user
        else if (this.status == 501)
          { alert("Bounty has changed locations since page last loaded.\n\nRefreshing page..."); location.reload(); }
        else 
          alert("Server failed to reclaim bounty.\n\nPlease contact Collin for support");
      }
    };
  }

  function removeBounty(_title, _claimed) {
    let request = new XMLHttpRequest();
    request.open("POST", window.location.href.replace('board', 'delete'), true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("filename="+_title+".json");

    request.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200)
          location.reload();
        else if (this.status == 501)
          { alert("Bounty has changed locations since page last loaded.\n\nRefreshing page..."); location.reload(); }
        else 
          alert("Server failed to delete bounty.");
      }
    };
    
  }

  function submitBounty() {
    const form = document.querySelector('#createForm');
    const titleInput = document.querySelector('#title').value.replaceAll(/\'|\"|;/g, '').trim();
    const priceInput = document.querySelector('#price').value;
    const tagsInput = document.querySelector('#tags').value.replaceAll(/,\s+/g, ',').split(",").filter(tag => tag.trim().length > 0);
    const descriptionInput = document.querySelector('#description').value;
    const specificationsInput = document.querySelector('#specifications').value.replaceAll(/,\s+/g, ',').split(",").filter(tag => tag.trim().length > 0);


    if(!titleInput) { alert('Enter a title'); return; }

    if(!priceInput) { alert('Enter a price'); return; }
    else if (isNaN(priceInput)) {alert('Price is not a valid number'); return;}

    if(!descriptionInput) { alert('Enter a description'); return; }
    if(specificationsInput.length == 0) { alert('Enter specifications'); return; }

    document.querySelector('#tags').value = tagsInput;
    document.querySelector('#specifications').value = specificationsInput;
    document.querySelector('#title').value = titleInput;
    form.submit();
}

function toggleRows() {
    const val = parseInt(rowSwitch.value.trim());

    claimedRow.style.display = "none";
    unclaimedRow.style.display = "none";
    if (allRow) {allRow.style.display = "none";}

    switch (val) {
      case 1: 
        unclaimedRow.style.display = "flex";
        break;
      case 2: 
        claimedRow.style.display = "flex";
        break;
      case 3:
        allRow.style.display = "flex";
        break;
    }   
}

function toggleTags() {
  const val = tagSelect.value.trim();
  const elementsWithATag = document.querySelectorAll('.tagged');

  if (val.length > 0) {
    elementsWithATag.forEach(element => {
      element.style.display = 'none';
    });

    const elementsWithSpecificTag = document.querySelectorAll('.tag-' + val);

    elementsWithSpecificTag.forEach(element => {
      element.style.display = 'block';
    });
  } else {
    elementsWithATag.forEach(element => {
      element.style.display = 'block';
    });
  }
}

function assign(_selectedObject, _title, _originalOwner, _id) {
  const val = _selectedObject.value.trim();

  if (_originalOwner === "noone") // No one claimed bounty, so assign to selected user
    claim(_title, val, true); 
  else if (val === "") // Someone claimed bounty, unclaim it from them
    claim(_title, _originalOwner, false);
  else // Someone claimed bounty, claim it to someone else
    reclaim(_title, _originalOwner, val);
}