const sql = require('mssql');

const config = {
    user: 'spenwall',
    password: 'Ng46Z@YT',
    server: 'mini-vans.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'vans',
    encrypt: true,
    connectionTimeout: 180000,
    options: {
        enableArithAbort: true,
    }
}

const allRecords = async() => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const results = await request.query('select * from vans');
            
        return results.recordset;
    } catch (err) {
        console.log(err);
        sql.close();
    }
}

const addRecord = async (ad) => {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        const query = `insert into vans (ad_id, title) values ('${ad.id}', '${ad.title}')`;
        console.log(query);
        const results = await request.query(query);

        console.dir(results);
    } catch (err) {
        console.log(err);
        sql.close();
    }
}

const bulk = async (ads) => {
  console.log(ads.length);
  if (ads.length < 1) {
    return;
  }

  const table = new sql.Table('vans');
  table.create = false;
  table.columns.add('ad_id', sql.VarChar, {nullable: true, primary: true})
  table.columns.add('title', sql.VarChar, {nullable: true});
  table.columns.add('price', sql.Int, {nullable: true});
  table.columns.add('description', sql.VarChar, {nullable: true});
  table.columns.add('date', sql.DateTime, {nullable: true});
  table.columns.add('url', sql.VarChar, {nullable: true});
  table.columns.add('image', sql.VarChar, {nullable: true});
  table.columns.add('year', sql.Int, {nullable: true});
  table.columns.add('make', sql.VarChar, {nullable: true});
  table.columns.add('model', sql.VarChar, {nullable: true});
  table.columns.add('trim', sql.VarChar, {nullable: true});
  table.columns.add('color', sql.VarChar, {nullable: true});
  table.columns.add('drivetrain', sql.VarChar, {nullable: true});
  table.columns.add('kms', sql.Int, {nullable: true});
  table.columns.add('sale_by', sql.VarChar, {nullable: true});
  table.columns.add('province', sql.VarChar, {nullable: true});
  table.columns.add('location', sql.VarChar, {nullable: true});
  table.columns.add('sunroof', sql.Bit, {nullable: true});
  table.columns.add('navigation', sql.Bit, {nullable: true});
  table.columns.add('heated_seats', sql.Bit, {nullable: true});
  table.columns.add('bluetooth', sql.Bit, {nullable: true});
  table.columns.add('hail', sql.Bit, {nullable: true});
  ads.forEach(ad => table.rows.add(...Object.values(ad)));
  
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    await request.bulk(table);
  } catch (error) {
      console.log(error);
  }
}

const averagePrice = async (model, year) => {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    const results = await request.query(`SELECT avg(price) as average FROM vans WHERE make = '${model}' AND year = ${year}`);
        
    return results.recordset[0].average;
  } catch (err) {
      console.log(err);
      sql.close();
  }
}

const close = () => {
    sql.close();
}

module.exports = {
    allRecords, 
    addRecord, 
    bulk,
    averagePrice,
    close
};