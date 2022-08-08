const config = require('config.json');
const jwt = require('jsonwebtoken');
const Role = require('_helpers/role');
const mysql = require("mysql2");


const poolPromise = mysql.createPool(
    {
        host: "localhost",
        user: "root",
        password: "1234",
        database: "spa",
        timezone: "Europe/Kiev"
    }).promise();

module.exports = {
    authenticate,
    getAll,
    getById,
    getAllService,
    getAllMasters,
    registration,
    getServicesByEmployee,
    getFreeTime,
    AddReservation,
    getReservationByEmployee,
    changeStatusEmployee,
    getReservation
};

async function authenticate({ username, password }) {
    console.log({ username, password },1255);
    let sql = `select user.id_user, user.email, user.name, user.phone, user.birthday_user, role.name as role, sign_in.id_employee\n` +
        `from user,sign_in, role\n` +
        `where login=\"${username}\"  and pasword=\"${password}\" and sign_in.id_user= user.id_user and sign_in.id_role=role.id_role;`

    const result= await poolPromise.execute(sql);
    const user = result[0];
    console.log(user[0].id_user);
    console.log(user[0].id_employee===null);
    if (user.length!==0) {
        if(user[0].id_employee!==null)
        {
            const token = jwt.sign({sub: user[0].id_employee, role: user[0].role}, config.secret);
            return {
                user,
                token
            };
        }
        else {
            console.log(user[0].id_user);
            const token = jwt.sign({sub: user[0].id_user, role: user[0].role}, config.secret);
            return {
                user,
                token
            };
        }
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {

    let sql = `select *` +
        `from user,sign_in\n` +
        `where user.id_user=${id} and sign_in.id_user= user.id_user;`;

    const result= await poolPromise.execute(sql);
    const user = result[0];
    if (!user) return;
    return user;
}

async function getAllService() {

    let sql = 'select id_service, services.name, type.name as type, time_avg, services.price,  services.desc_ser \n' +
        '        from services, type\n' +
        '        where services.id_type=type.id_type';

    const result= await poolPromise.execute(sql);
    const services = result[0];
    if (!services) return;
    return services;
}
async function getAllMasters() {

    let sql = 'call GetEmployee();';

    const result= await poolPromise.execute(sql);
    const masters = result[0];
    if (!masters) return;
    return masters;
}
async function registration({login,password, phone,name,birthday_user}) {
    console.log(login,password, phone,name,birthday_user);
    let sql = `call Regestration(\"${login}\",\"${password}\",\"${phone}\",\"${name}\",\'${birthday_user}\'); `;
    console.log(sql);
    const result= await poolPromise.execute(sql);
    return result;

}
async function getServicesByEmployee(id_serv) {
    console.log(id_serv);
    let sql = `call GetEmployeeByService(\"${id_serv}\")`;
    console.log(sql);
    const result= await poolPromise.execute(sql);
    const masters = result[0];
    if (!masters) return;
    return masters;

}

async function getFreeTime({id_serv,   id_emp,   r_date}) {
    console.log(id_serv,   id_emp,   r_date);
    let sql = `call Reserv(${id_serv},${id_emp}, \'${r_date}\')`;
    console.log(sql);
    const result= await poolPromise.execute(sql);
    const times = result[0];
    if (!times) return;
    return times;

}
async function getReservationByEmployee(  {id_status}, id_emp) {

    let sql = `call GetReservByEmployee(${id_emp},${id_status})`;

    const result= await poolPromise.execute(sql);
    const reservation = result[0];
    if (!reservation) return;
    return reservation;

}
async function getReservation(  {id_status}) {

    let sql = `call GetRes(${id_status})`;

    const result= await poolPromise.execute(sql);
    const reservation = result[0];
    if (!reservation) return;
    return reservation;

}
async function changeStatusEmployee(  {id_status,id_service, id_reservation}) {

    let sql = `call EmployeeStatus(${id_service},${id_reservation},${id_status})`;
    console.log(sql);
    const result= await poolPromise.execute(sql);
    const reservation = result[0];
    if (!reservation) return;
    return reservation;

}

async function AddReservation({id_serv,   id_emp,   r_date,t_s, e_t }, id_user) {
    console.log(id_user);
    let sql = `call r (${id_user}) `
    const result= await poolPromise.execute(sql);
    const id_res = result[0][0][0].id_res;
    if (id_res)
    {
        let sql = `call reservation(${id_res},${id_emp},${id_serv}, '${t_s}','${e_t}','${r_date}');`
        console.log(sql);
        const resul= await poolPromise.execute(sql);
        const t = resul[0];
        if (!t) return;
        return t;
    }
}