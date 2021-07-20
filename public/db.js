let db;
const request = window.indexedDB.open("offlineBudget", 1);

request.onupgradeneeded = e => {
    db = e.target.result
    const pendingStore = db.createObjectStore("pending", {autoIncrement: true});
    pendingStore.createIndex("statusIndex", "status")
}

request.onsuccess = e => {
    db = e.target.result;

    if(navigator.onLine){
        onlineDBCheck()
    }
}

function onlineDBCheck() {
    const transaction = db.transaction(["pending"], "readwrite");
    const checking = transaction.objectStore("pending");
    const getInfo = checking.getAll()

    getInfo.onsuccess = function() {
        if(getInfo.result.length > 0){
            //do something here maybe perhaps in the future, we'll see. There's a lot going on right now
            //I can see smoke coming out of my ears, please brain. Send help
            fetch('/api/transaction/bulk', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getInfo.result)
            })
            .then(success => {
                const transHistory = db.transaction(["pending"], "readwrite");
                const clearHistory = transHistory.objectStore("pending");
                clearHistory.clear()
            })
        }
    }
}

function saveNewTransaction(object) {
    db = request.result;
    const transaction = db.transaction(["pending"], "readwrite");
    const checking = transaction.objectStore("pending");
    checking.add(object)
}
window.addEventListener("online", onlineDBCheck)