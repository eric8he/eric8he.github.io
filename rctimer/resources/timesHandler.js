class timesHandler {
    constructor(trimSize) {
        this.arr = [1, 3, 5, 4, 9, 12, 6, 2, 5];
        this.trimSize = trimSize;
    };

    addTime = function(time) {
        this.arr += time;
    }

    getAvgOf = function(N) {
        //put all necessary non-DNF times in array
        var firstNt = [];
        for (var i = this.arr.length - 1; i >= 0 && firstNt.length < N; i--) {
            if (this.arr[i] != "DNF") {
                firstNt.push(this.arr[i]);
            }
        }

        console.log(firstNt.length);

        //find out # of times trimmed off each end
        var valsDeletedPerEnd = this.trimSize * N / 2;

        //sort array
        firstNt.sort();

        //calculate average without trimmed elements
        var sum = 0;
        var iters = 0;
        for (var i = Math.ceil(valsDeletedPerEnd); i < firstNt.length - valsDeletedPerEnd - 1; i++) {
            console.log(firstNt[i]);
            sum += firstNt[i];
            iters++;
        }
        return sum / iters;
    }

    setTrimSize = function(T) {
        this.trimSize = T;
    }
}