var aptjs = require('../');

describe('#map', function() {
	it('should execute worker on data in serial when batchSize is 1', function(done) {
		var data = ['fail:never', 'fail:never', 'fail:never'], iE = 0, exec = false, job;

		job = aptjs.map(1, data);
		job.on('task', worker);
		job.on('complete', function() {
			if(iE !== 3) { done(new Error('Worker should have been executed 3 times.')); }
			else { done(); }
		});
		job.on('error', function() {
			done(new Error('Should not emit error event.'));
		});
		job.start();

		function worker(data, task) {
			if(exec) { done(new Error('should not execute the worker more than once at a time.')); }
			exec = true;
			setTimeout(function() {
				exec = false;
				iE += 1;
				if(data === 'fail:never') { task.done(); }
				else if(data === 'fail:always' || task.attempts > parseFloat(data.split(':')[1])) {
					task.error();
				} else { task.retry(); }
			}, 100);
		}
	});

	it('should execute worker on data in parallel if batchSize is the length of the data', function(done) {
		var data = ['fail:never', 'fail:never', 'fail:never'], iE = 0, exec = true, job;

		job = aptjs.map(data.length, data);
		job.on('task', worker);
		job.on('complete', function() {
			if(iE !== 3) { done(new Error('Worker should have been executed 3 times.')); }
			else { done(); }
		});
		job.on('error', function() {
			done(new Error('Should not emit error event.'));
		});
		job.start();

		function worker(data, task) {
			if(!exec) { done(new Error('should execute the worker on all data at the same time.')); }
			exec = true;
			setTimeout(function() {
				exec = false;
				iE += 1;
				if(data === 'fail:never') { task.done(); }
				else if(data === 'fail:always' || task.attempts > parseFloat(data.split(':')[1])) {
					task.error();
				} else { task.retry(); }
			}, 100);
		}
	});
});

describe('#execute', function() {
	it('should execute each worker', function(done) {
		var job, iE = 0;

		job = aptjs.execute(3, a, b, c);
		job.on('complete', function(data) {
			if(data.indexOf('a') < 0) { done(new Error('Worker a was not executed.')); }
			else if(data.indexOf('b') < 0) { done(new Error('Worker b was not executed.')); }
			else if(data.indexOf('c') < 0) { done(new Error('Worker c was not executed.')); }
			else { done(); }
		});
		job.start();

		function a(task) {
			iE += 1;
			task.done('a');
		}
		function b(task) {
			iE += 1;
			task.done('b');
		}
		function c(task) {
			iE += 1;
			task.done('c');
		}
	});
});
