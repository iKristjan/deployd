var db = require('../lib/db')
  , TEST_DB = {name: 'test-db', host: 'localhost', port: 27017}
  , tester = db.connect(TEST_DB)
  , store = tester.createStore('test-store')
  , Store = require('../lib/db').Store;

beforeEach(function(done){
  store.remove(function () {
    store.find(function (err, result) {
      expect(err).to.not.exist;
      expect(result).to.eql([]);
      done(err);
    })
  })
})

describe('db', function(){
  describe('.connect(options)', function(){
    it('should connect to the database', function(done) {
      var tester = db.connect(TEST_DB);
      
      tester.on('connected', function () {
        done();
      });
    })
  })
})

describe('db', function(){
  // TODO: this takes forever, move to integration?
  // describe('.drop(fn)', function(){
  //   it('should drop the database', function(done) {
  //     var tester = db.connect(TEST_DB);
  //     tester.on('connected', function () {
  //       store.insert({foo: 'bar'}, function () {
  //         tester.drop(function (err) {
  //           expect(err).to.not.exist;
  //           store.find(function (err, res) {
  //             expect(res).to.not.exist;
  //             done(err);
  //           })
  //         })
  //       })
  //     })
  //   })
  // })
})

describe('store', function(){

  describe('.find(query, fn)', function(){
    it('should not find anything when the store is empty', function(done) {
      store.find(function (err, empty) {
        expect(empty).to.eql([]);
        done(err);
      })
    })
    
    it('should pass the query to the underlying database', function(done) {
      store.insert([{i:1},{i:2},{i:3}], function () {
        store.find({i: {$lt: 3}}, function (err, result) {
          expect(result).to.exist;
          result.forEach(function (obj) {
            expect(obj.id).to.be.a('string');
          });
          expect(result).to.have.length(2);
          done(err);
        })
      })
    })
  })

  describe('.identify(object)', function() {
    it('should add an _id to the object', function() {
      var object = {};
      store.identify(object);
      expect(object._id.length).to.equal(16);
    })

    it('should change _id to id', function() {
      var object = {_id: 'aaaaaaaabbbbbbbb'};
      store.identify(object);
      expect(object.id.length).to.equal(16);
    })
  })
  
  describe('.remove(query, fn)', function(){
    it('should remove all the objects that match the query', function(done) {
      store.insert([{i:1},{i:2},{i:3}], function () {
        store.remove({i: {$lt: 3}}, function (err, result) {
          expect(result).to.not.exist;
          store.find(function (err, result) {
            expect(result).to.have.length(1);
            done(err);
          })
        })
      })
    })
    
    it('should remove all the objects', function(done) {
      store.insert([{i:1},{i:2},{i:3}], function () {
        store.remove(function (err, result) {
          expect(result).to.not.exist;
          store.find(function (err, result) {
            expect(result).to.eql([]);
            done(err);
          })
        })
      })
    })
  })
  
  describe('.insert(namespace, object, fn)', function(){
    it('should insert the given object into the namespace', function(done) {
      store.insert({testing: 123}, function (err, result) {
        expect(result.id).to.exist;
        expect(result.testing).to.equal(123);
        done();
      })
    })
    
    it('should insert the given array into the namespace', function(done) {
      store.insert([{a:1}, {b:2}], function (err, result) {
        expect(Array.isArray(result)).to.equal(true);
        expect(result[0].id).to.exist;
        expect(result[0].a).to.equal(1);
        expect(result[1].id).to.exist;
        expect(result[1].b).to.equal(2);
        expect(result).to.have.length(2);
        done(err);
      })
    })
  })
  
  describe('.update(query, updates, fn)', function(){
    it('should update only the properties provided', function(done) {
      store.insert({foo: 'bar'}, function (err, result) {
        expect(err).to.not.exist;
        var query = {id: result.id};
        store.update(query, {foo: 'baz'}, function (err) {
          expect(err).to.not.exist;
          store.first(query, function (err, result) {
            expect(result.foo).to.equal('baz');
            done(err);
          })
        })
      })
    })
  })
  
  describe('.rename(namespace, fn)', function(){
    it('should rename the underlying database representation of the store', function(done) {
      store.insert([{i:1},{i:2},{i:3}], function () {
        store.rename('foo-store', function () {
          store.find({i: {$lt: 3}}, function (err, result) {
            expect(result).to.exist;
            expect(result).to.have.length(2);
            store.rename('test-store', function () {
              store.find({i: {$lt: 3}}, function (err, result) {
                expect(result).to.exist;
                expect(result).to.have.length(2);
                done(err);
              })
            })
          })
        })
      })
    })
  })
})