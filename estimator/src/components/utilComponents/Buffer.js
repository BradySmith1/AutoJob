import axios from "axios";

export class Buffer {
    constructor(min, fillApi, transformData) {
        this.buffArr = [];
        this.min = min;
        this.fillApi = fillApi;
        this.mutex = false;
        this.transformData = transformData;
    }

    initialize(arr) {
        this.buffArr = arr;
    }

    read() {
        var element;

        if(this.buffArr.length < this.min){
            axios.get(this.fillApi).then((response) => {
                console.log(response);
                var data = this.transformData(response.data);
                var interval = setInterval(() => {
                    if(!this.mutex){
                        this.mutex = true;
                        this.buffArr =  [...this.buffArr, ...data];
                        this.mutex = false;
                        clearInterval(interval);
                    }
                }, 10)
            })
        }

        if(this.buffArr.length <= 0 || this.mutex){
            var interval = setInterval(() => {
                if(this.buffArr.length > 0 && !this.mutex){
                    this.mutex = true;
                    element = this.buffArr.splice(0, 1);
                    this.mutex = false;
                    clearInterval(interval);
                }
            }, 100);
        }else{
            this.mutex = true;
            element = this.buffArr.splice(0, 1);
            this.mutex = false;
        }
        return element[0];
    }
}