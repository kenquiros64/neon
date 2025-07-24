export namespace models {
	
	export class Count {
	    key: string;
	    value: number;
	    last_reset: string;
	
	    static createFrom(source: any = {}) {
	        return new Count(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.last_reset = source["last_reset"];
	    }
	}
	export class Time {
	    hour: number;
	    minute: number;
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hour = source["hour"];
	        this.minute = source["minute"];
	    }
	}
	export class Stop {
	    name: string;
	    code: string;
	    fare: number;
	    gold_fare: number;
	    is_main: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Stop(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.code = source["code"];
	        this.fare = source["fare"];
	        this.gold_fare = source["gold_fare"];
	        this.is_main = source["is_main"];
	    }
	}
	export class Route {
	    id: string;
	    departure: string;
	    destination: string;
	    stops: Stop[];
	    timetable: Time[];
	    holiday_timetable: Time[];
	
	    static createFrom(source: any = {}) {
	        return new Route(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.departure = source["departure"];
	        this.destination = source["destination"];
	        this.stops = this.convertValues(source["stops"], Stop);
	        this.timetable = this.convertValues(source["timetable"], Time);
	        this.holiday_timetable = this.convertValues(source["holiday_timetable"], Time);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Ticket {
	    id: string;
	    departure: string;
	    destination: string;
	    username: string;
	    stop: string;
	    time: string;
	    fare: number;
	    is_gold: boolean;
	    is_null: boolean;
	    report_id: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Ticket(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.departure = source["departure"];
	        this.destination = source["destination"];
	        this.username = source["username"];
	        this.stop = source["stop"];
	        this.time = source["time"];
	        this.fare = source["fare"];
	        this.is_gold = source["is_gold"];
	        this.is_null = source["is_null"];
	        this.report_id = source["report_id"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	
	export class User {
	    username: string;
	    password: string;
	    name: string;
	    role: string;
	    created_at: string;
	    updated_at?: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.password = source["password"];
	        this.name = source["name"];
	        this.role = source["role"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}

}

