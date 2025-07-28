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
	export class Report {
	    id: number;
	    username: string;
	    partial_tickets: number;
	    partial_cash: number;
	    final_cash: number;
	    status: boolean;
	    total_cash: number;
	    total_tickets: number;
	    total_gold: number;
	    total_gold_cash: number;
	    total_null: number;
	    total_null_cash: number;
	    total_regular: number;
	    total_regular_cash: number;
	    partial_closed_at?: string;
	    closed_at?: string;
	    created_at?: string;
	
	    static createFrom(source: any = {}) {
	        return new Report(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.partial_tickets = source["partial_tickets"];
	        this.partial_cash = source["partial_cash"];
	        this.final_cash = source["final_cash"];
	        this.status = source["status"];
	        this.total_cash = source["total_cash"];
	        this.total_tickets = source["total_tickets"];
	        this.total_gold = source["total_gold"];
	        this.total_gold_cash = source["total_gold_cash"];
	        this.total_null = source["total_null"];
	        this.total_null_cash = source["total_null_cash"];
	        this.total_regular = source["total_regular"];
	        this.total_regular_cash = source["total_regular_cash"];
	        this.partial_closed_at = source["partial_closed_at"];
	        this.closed_at = source["closed_at"];
	        this.created_at = source["created_at"];
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
	    id: number[];
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
	    id: number;
	    departure: string;
	    destination: string;
	    username: string;
	    stop: string;
	    time: string;
	    fare: number;
	    is_gold: boolean;
	    is_null: boolean;
	    id_number: string;
	    report_id: number;
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
	        this.id_number = source["id_number"];
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

