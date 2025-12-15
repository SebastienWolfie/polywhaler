import { doc, collection, updateDoc, setDoc, getDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Date from '../utils/Date'

async function getWatchlist(id) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, 'polywhaler_watchlist', id)
        const querySnapshot = await getDoc(docRef);
  
        resolve(querySnapshot.data());
    })
}


async function update(id, item) {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = doc(db, 'polywhaler_watchlist', id);
            const result = await updateDoc(docRef, item)
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
  }

  async function getAllForUser(id) {
    return new Promise(async (resolve, reject) => {
        const collectionRef = collection(db, 'polywhaler_watchlist');
        const q = query(collectionRef, where("userID", "==", id));

        const querySnapshot = await getDocs(q);
  
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        })
        resolve(list || []);
    })
}



async function create(userID, address, pseudonym) {
    return new Promise(async(resolve, reject) => {
        try {
             const collectionRef = collection(db, 'polywhaler_watchlist');
             const docRef = doc(collectionRef)
             const id = docRef.id;
             const item = {
                id: docRef.id,
                userID,
                address,
                pseudonym,
                dateCreated: new Date().toJSON(),
            };
 
             await setDoc(docRef, item)
             resolve(item);
         } catch (error) {
             reject(error)
         }
    })
}


async function getAll() {
    return new Promise(async (resolve, reject) => {
        const collectionRef = collection(db, 'polywhaler_watchlist');
        const querySnapshot = await getDocs(collectionRef);
  
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data());
        })
        resolve(list);
    })
}
  async function deleteWatchlist(uid, address) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!uid || !address) return reject('invalid user id or trader addresss');
            const watchlistRef = collection(db, 'polywhaler_watchlist');
            const q = query(
            watchlistRef,
                where("address", "==", address)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                reject("No matching watchlist entry found for this address.");
            }
            for (const docSnap of snapshot.docs) {
                await deleteDoc(docSnap.ref);
                console.log("Watchlist entry deleted:", docSnap.id);
            }
            resolve()
        } catch (error) {
            reject(error)
            console.log(error)
        }
        
    })
  }

export { getWatchlist,
         update,
         create,
         getAll,
         getAllForUser,
         deleteWatchlist
        }