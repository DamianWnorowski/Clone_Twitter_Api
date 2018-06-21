const app = require('../../User/user-server')
const User = require('../models/user')(app.mongoose);
const server = app.server;
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

const getUser = (i) => {
    return {
        username: "test_user" + i,
        email: "test_user" + i + "@gmail.com",
        password: "pass"
    }
}

const getUniqueUser = () => {
    let rand = Math.floor(Math.random() * 999) + 100;
    return getUser(rand);
}

User.collection.remove({})

describe('User', () => {
    afterEach((done) => { 
        User.collection.remove({}, () => {done()}) 
    })

    describe('/POST adduser -- valid-format', () => {
        it('it should POST a new user', (done) => {
            let user = getUniqueUser();

            chai.request(server)
            .post('/adduser')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("status").eql("OK");
                Object.keys(res.body).length.should.be.eql(1);
                done();
            });
        });

        it('it should reject a new user with an existing username', (done) => {
            let user = new User(getUser(0));
            user.save((err, user) => {
                const dupUsername = getUser(0)
                dupUsername.email = "diff_email@gmail.com"
                chai.request(server)
                .post('/adduser')
                .send(dupUsername)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql("error");
                    res.body.should.have.property("error");
                    //console.log(res.body);
                    Object.keys(res.body).length.should.be.eql(2);
                    done();
                });
            })
        });

        it('it should reject a new user with an existing email', (done) => {
            let user = new User(getUser(0));
            user.save((err, user) => {
                const dupEmail = getUser(0)
                dupEmail.username = "diff_username"
                chai.request(server)
                .post('/adduser')
                .send(dupEmail)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql("error");
                    //console.log(res.body);
                    Object.keys(res.body).length.should.be.eql(2);
                    done();
                });
            })
        });

    });

    describe('/POST adduser -- invalid-format', () => {
        let email = "test_user1@gmail.com";
        let username = "test_user1";       
        let password = "pass";

        it('it should reject a new user with missing username', (done) => {
            chai.request(server)
            .post('/adduser')
            .send({email, password})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("status").eql("error");
                res.body.should.have.property("error");
                Object.keys(res.body).length.should.be.eql(2);
                done();
            });
        });

        it('it should reject a new user with missing email', (done) => {
            chai.request(server)
            .post('/adduser')
            .send({username, password})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("status").eql("error");
                res.body.should.have.property("error");
                Object.keys(res.body).length.should.be.eql(2);
                done();
            });
        });

        it('it should reject a new user with missing password', (done) => {
            chai.request(server)
            .post('/adduser')
            .send({email, username})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("status").eql("error");
                res.body.should.have.property("error");
                Object.keys(res.body).length.should.be.eql(2);
                done();
            });
        });
    });

    describe('/POST verify -- valid-format', () =>{
        it('it should verify the user', (done) => {
            let user = new User(getUser(0));
            user.save((err, user) => {
                chai.request(server)
                .post('/verify')
                .send({email: user.email, key: 'abracadabra'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql("OK");
                    Object.keys(res.body).length.should.be.eql(1);
                    done();
                });
            });
        });
    });

    describe('/POST verify -- invalid-format', () =>{
        it('it should not verify the user', (done) => {
            let user = new User(getUser(0));
            user.save((err, user) => {
                chai.request(server)
                .post('/verify')
                .send({email: user.email, key: 'aaaa'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql("error");
                    res.body.should.have.property("error");
                    Object.keys(res.body).length.should.be.eql(2);
                    done();
                });
            });
        });
    });

    describe('/POST login -- valid-format', () => {
        it('it should login the user', (done) => {
            let userData = getUser(0)
            let user = new User(userData);
            user.save((err) => {
                chai.request(server)
                .post('/verify')
                .send({email: userData.email, key: 'abracadabra'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql("OK");
                    Object.keys(res.body).length.should.be.eql(1);

                    chai.request(server)
                    .post('/login')
                    .send({username: userData.username, password: userData.password})
                    .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property("status").eql("OK");
                            Object.keys(res.body).length.should.be.eql(1);
                            done();
                    });
                });
            });
        });
    });

    
});