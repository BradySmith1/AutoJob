import axios from "axios";

/**
 * @version 1, April 14th, 2024
 * @author Andrew Monroe
 * @author Brady Smith
 *
 * This Object creates a buffer/sliding window of ID's that can be used when
 * adding new schemas.
 */
export class Buffer {
  /**
   * COnstructor to initialize the object
   * @param {number} min, minimum number of id's
   * @param {string} fillApi, api to use to get new elements
   * @param {funcion} transformData, function to transform requested data
   */
  constructor(min, fillApi, transformData) {
    //Buffer array
    this.buffArr = [];
    //ID minimum
    this.min = min;
    //Fill Api String
    this.fillApi = fillApi;
    //Mutex for buffer
    this.mutex = false;
    //Transform function
    this.transformData = transformData;
  }

  /**
   * Funciton to initialize the buffer array
   * @param {Array} arr, new array
   */
  initialize(arr) {
    this.buffArr = arr;
  }

  /**
   * Funciton to read an element
   *
   * @returns {object} element to return
   */
  read() {
    //element to return
    var element;

    //If the buffer lenght is less than the minimum
    if (this.buffArr.length < this.min) {
      //Get a new batch of elements
      axios.get(this.fillApi).then((response) => {
        //Transform the data
        var data = this.transformData(response.data);
        //Set an interval to check if data can be added
        var interval = setInterval(() => {
          //If the data is not currently being modified
          if (!this.mutex) {
            //Add elements to buffer
            this.mutex = true;
            this.buffArr = [...this.buffArr, ...data];
            this.mutex = false;
            clearInterval(interval);
          }
        }, 10);
      });
    }

    //If the buffer is empty or the mutex is active
    if (this.buffArr.length <= 0 || this.mutex) {
      //Set interval to check back
      var interval = setInterval(() => {
        //Once the buffer has elements and is not being updated
        if (this.buffArr.length > 0 && !this.mutex) {
          //read in the element
          this.mutex = true;
          element = this.buffArr.splice(0, 1);
          this.mutex = false;
          clearInterval(interval);
        }
      }, 100);
    } else {
      //Else, set mutext to true and read
      this.mutex = true;
      element = this.buffArr.splice(0, 1);
      this.mutex = false;
    }
    return element[0];
  }
}
