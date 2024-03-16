const {app,auth, db} = require('../connection/firebase');
const {signInWithEmailAndPassword, createUserWithEmailAndPassword} = require('firebase/auth');
const {ref,get,set, child} = require('firebase/database');
const { v4: uuidv4 } = require('uuid');

exports.loginQuery = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth,email, password);
        console.log(result);
        if(result) {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef,`teachers/${result.user.uid}`));
            if(snapshot.exists()) {
                return {auth : true, response : snapshot.val()}
            } else {
                return {auth : false}
            }
           
        } else {
            return {auth : false}
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return {auth : false}
    }
}

exports.signUpQuery = async (email,password, userData) => {
    try {
        const result = await createUserWithEmailAndPassword(auth,email, password);
        console.log(result);
        if(result) {
            console.log(result);
            const dbRef = ref(db);
            await set(child(dbRef,`/teachers/${result.user.uid}`),{...userData, email, students : []});

            return {auth : true, response : result}
        } else {
            return {auth : false}
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return {auth : false}
    }
}

exports.getTeacherMappedStudent = async (userId) => {
   try {
    const  dbRef = ref(db, `teachers/${userId}/students`);
    const studentList = await get(dbRef);
    if(!studentList.exists()){
        throw new Error ("No Student Mapped with Teacher")
    }
    const studentListID = studentList.val();
    const allStudents = await get(child(ref(db), 'students'));
    if(!allStudents.exists()) {
        throw new Error('No Students available')
    }
    const allStudentsData = allStudents.val();
    teacherSpecifiedStudentData = Object.entries(allStudentsData).filter(([key, value])=> studentListID.includes(key)).map(([key,value])=> ({...value, key:key }))
    return teacherSpecifiedStudentData
    } catch (e) {
        console.log("Error : ",e);
        return null
   }
}

exports.addStudent = async (userId, studentData) =>{
    try {
        const studentID  = uuidv4();
        const studentDbRef = ref(db, `/students/${studentID}`);
        await set(studentDbRef, studentData); 
        const  dbRef = ref(db, `/teachers/${userId}/students`);
        const studentList = await get(dbRef);
        if(!studentList.exists()){
            const studentList = [studentID];
            await set(dbRef, studentList);
            return true
        } else {
            const studentIds = studentList.val();
            let  updatedList =[...studentIds , studentID];
            await set(dbRef, updatedList);
            return true
        }
    } catch (e) {
        console.log("Error in adding student");
    }   
}

exports.getOneStudent = async (studentID)=>{
    try {
        const dbRef = ref(db, `students/${studentID}`);
        const snapshot = await get(dbRef);
        if (!snapshot.exists()) {
            throw  new Error(`Student with id ${studentID}`)
        } 
        return snapshot.val();
        
    } catch (e) {
        console.error('ERROR: ', e);
        return null
    }
}