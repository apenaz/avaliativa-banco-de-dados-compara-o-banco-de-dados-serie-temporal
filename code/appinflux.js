const Influx = require('influx')

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'anjoparaela',
    schema: [
        {
            measurement: 'vni',
            fields: {
                vc: Influx.FieldType.FLOAT,
                fr: Influx.FieldType.FLOAT,
                sp: Influx.FieldType.FLOAT,
                fc: Influx.FieldType.FLOAT
            },
            tags: ['day', 'hour', 'minute', 'second', 'patient']
        },
        {
            measurement: 'insertion_time',
            fields: {
                value: Influx.FieldType.INTEGER
            },
            tags: ['day', 'hour', 'minute', 'second', 'timecount']
        }
    ]
})


influx.getDatabaseNames()
    .then(names => {
        if (!names.includes('anjoparaela')) {
            return influx.createDatabase('anjoparaela');
        }
    })
    .then(() => {
        console.log('ok-ok-ok')
    })
    .catch(err => {
        console.error(`Error creating Influx database!`);
    })

async function insert_point() {
    let second, minute, hour, day = 0;
    let inserts_per_second = 500 //250 patients
    for ( day = 1; day < 366; day++) {
        for ( hour = 0; hour < 10; hour++) {//  10 hours with vni 
            let start_hour = Date.now()
            for ( minute = 0; minute < 60; minute++) {//  60 minutes
                let start_minute = Date.now()
                for ( second = 0; second < 60; second++) {// 60 seconds 
                    let start_second = Date.now()
                    for (let patient = 0; patient < inserts_per_second; patient++) {
                        influx.writePoints([
                            {
                                measurement: 'vni',
                                tags: { day: `${day}`, hour: `${hour}`, minute: `${minute}`, second: `${second}`, patient: `${patient}` },
                                fields: { vc: (Math.random() * 6), fr: (Math.random() * 40.00 + 40), sp: (Math.random() * 15.00 + 84), fc: (Math.random() * 40.00 + 40) }
                            }
                        ])
                    }//inserts in a second
                    let stop_second = Date.now()
                    time_to_insert = stop_second - start_second
                    await influx.writePoints([
                        {
                            measurement: 'insertion_time',
                            tags: { day: `${day}`, hour: `${hour}`, minute: `${minute}`, second: `${second}`, timecount: 'second' },
                            fields: { value: time_to_insert },
                        }
                    ])
                    console.log(`second${second} - minute${minute} - hour${hour} - day${day}`);
                }// 60 seconds
                let stop_minute = Date.now()
                time_to_insert = stop_minute - start_minute
                await influx.writePoints([
                    {
                        measurement: 'insertion_time',
                        tags: { day: `${day}`, hour: `${hour}`, minute: `${minute}`, second: `${second}`, timecount: 'minute' },
                        fields: { value: time_to_insert },
                    }
                ])
            }// 60 minutes
            let stop_hour = Date.now()
            time_to_insert = stop_hour - start_hour
            await influx.writePoints([
                {
                    measurement: 'insertion_time',
                    tags: { day: `${day}`, hour: `${hour}`, minute: `${minute}`, second: `${second}`, timecount: 'hour' },
                    fields: { value: time_to_insert },
                }
            ])
        }//10 hours
    }// 365 days
}// insert_point function

insert_point()