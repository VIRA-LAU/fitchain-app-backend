import { INestApplication, ValidationPipe } from '@nestjs/common'
import {Test} from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum';
import { AuthSigninDto, AuthSignupDto } from '../src/auth/dto';
import { CreateInvitationDto, EditInvitationDto } from 'src/invitetogame/dto';
import { invitationApproval, gameStatus } from '@prisma/client';
import { createBookingDto, editBookingDto } from 'src/game/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () =>{
    const moduleRef = await Test.createTestingModule({
      imports:[AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));  
    
    await app.init();
    await app.listen(3333)
    prisma = app.get(PrismaService)
    // await prisma.CleanDb();
    pactum.request.setBaseUrl('http://localhost:3333')

  })

  afterAll(() =>{
    app.close();
  })

  describe('Auth', () => {
    const dto_signup_user1 :AuthSignupDto = {
      email:'saraalarab2000@gmail.com',
      phoneNumber:"+96103027609",
      firstName:"Sara",
      lastName:"Al Arab",
      password:'123'
    }

    const dto_signup_user2 :AuthSignupDto = {
      email:'khaled.jalloul@hotmail.com',
      phoneNumber:"+96103760943",
      firstName:"Khaled",
      lastName:"Jalloul",
      password:'4567'
    }

    const dto_signup_user3 :AuthSignupDto = {
      email:'jane.doe@example.com',
      phoneNumber:"+96176095434",
      firstName:"Jane",
      lastName:"Doe",
      password:'7890'
    }
    const dto_signin :AuthSigninDto = {
      email:'saraalarab2000@gmail.com',
      password:'123'
    }
    describe('Signup', () =>{
      it('Should throw error if email is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({password: dto_signup_user1.password, phoneNumber: dto_signup_user1.phoneNumber, firstName: dto_signup_user1.firstName, lastName: dto_signup_user1.lastName}).expectStatus(400)
      })

      it('Should throw error if password is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup_user1.email, phoneNumber: dto_signup_user1.phoneNumber, firstName: dto_signup_user1.firstName, lastName: dto_signup_user1.lastName}).expectStatus(400)
      })

      it('Should throw error if phoneNumber is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup_user1.email,password: dto_signup_user1.password, firstName: dto_signup_user1.firstName, lastName: dto_signup_user1.lastName}).expectStatus(400)
      })

      it('Should throw error if firstName is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup_user1.email,password: dto_signup_user1.password, phoneNumber: dto_signup_user1.phoneNumber,  lastName: dto_signup_user1.lastName}).expectStatus(400)
      })

      it('Should throw error if lastName is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup_user1.email,password: dto_signup_user1.password, phoneNumber: dto_signup_user1.phoneNumber,  firstName: dto_signup_user1.firstName}).expectStatus(400)
      })

      it('Should throw error if body is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).expectStatus(400)
      })

      it('Should signup user 1', ()=>{
        return pactum.spec().post('/auth/signup',).withBody(dto_signup_user1).expectStatus(201)
      })

      // it('Should signup user 2', ()=>{
      //   return pactum.spec().post('/auth/signup',).withBody(dto_signup_user2).expectStatus(201)
      // })

      // it('Should signup user 3', ()=>{
      //   return pactum.spec().post('/auth/signup',).withBody(dto_signup_user3).expectStatus(201)
      // })


    })

    describe('Signin', () =>{

      it('Should throw error if email is empty ', ()=>{
        return pactum.spec().post('/auth/signin',).withBody({password: dto_signin.password}).expectStatus(400)
      })

      it('Should throw error if password is empty ', ()=>{
        return pactum.spec().post('/auth/signin',).withBody({email: dto_signin.email}).expectStatus(400)
      })

      it('Should throw error if body is empty ', ()=>{
        return pactum.spec().post('/auth/signin',).expectStatus(400)
      })

      it('Should signin', ()=>{
        return pactum.spec().post('/auth/signin',).withBody(dto_signin).expectStatus(200).stores('UserAt','access_token')
      })

    })

  })
  describe('User', () => {

    describe('Get me', () =>{
      it('Should get user', ()=>{
      return pactum.spec().get('/users/me',).withHeaders({
        Authorization:'Bearer $S{UserAt}'
      }).expectStatus(200)
    })

    })
     
    // describe('Edit User', () =>{
    //   it('Should edit user', ()=>{
    //     const dto : EditUserDto = {
    //       firstName: 'Sara',
    //       lastName: 'Al Arab'
    //     }
    //     return pactum.spec().patch('/users',).withHeaders({
    //       Authorization:'Bearer $S{UserAt}'
    //     }).withBody(dto).expectStatus(200).expectBodyContains(dto.firstName)
    //   })

    // })


  })


  describe('Invitations', () =>{

    describe('get empty  invitations', () =>{
      it('Should get invitations', ()=>{
        return pactum.spec().get('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })

    })


    describe('create invitation', () =>{
      const dto : CreateInvitationDto = {
        friendId:2,
        gameId:1,

      }
      it('Should create invitation', ()=>{
        return pactum.spec().post('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(201).stores('invitationId','id')
      })

    })
    
    describe('get invitations', () =>{
      it('Should get invitations', ()=>{
        return pactum.spec().get('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(1).inspect()
      })


    })

    describe('get invitation by id', () =>{
      it('Should get invitation by Id', ()=>{
        return pactum.spec().get('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{invitationId}')
      })

    })
    // describe('edit invitation by id', () =>{
    //   const dto : EditInvitationDto = {
    //     status: invitationApproval.APPROVED,
    //   }
    //   it('Should edit invitation by Id', ()=>{
    //     return pactum.spec().patch('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
    //       Authorization:'Bearer $S{UserAt}'
    //     }).withBody(dto).expectStatus(200)
    //   })

    // })
    describe('delete invitation by id', () =>{
      it('Should delete invitation by Id', ()=>{
        return pactum.spec().delete('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(204)
      })
      it('Should get invitations', ()=>{
        return pactum.spec().get('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(0)
      })

    })

  })

  describe('Bookings', () =>{

    describe('get empty bookings', () =>{
      it('Should get bookings', ()=>{
        return pactum.spec().get('/games/bookings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([]).inspect()

      })


    }) 

    describe('create booking', () =>{
      const dto : createBookingDto = {
        courtId:1,
        date:new Date('2019-05-14T11:01:58.135Z'),
        duration: 30,
      }

      it('Should create booking', ()=>{
        return pactum.spec().post('/games/bookings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(201).stores('bookingId','id')
      })

    })

    describe('edit booking by id', () =>{
      const dto : editBookingDto = {
        status: gameStatus.APPROVED
      }
      it('Should edit booking by Id', ()=>{
        return pactum.spec().patch('/games/bookings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200)
      })

    })


    describe('get bookings', () =>{
      it('Should get bookings', ()=>{
        return pactum.spec().get('/games/bookings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(1).inspect()
      })


    })
    describe('get booking by id', () =>{
      it('Should get booking by Id', ()=>{
        return pactum.spec().get('/games/bookings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{bookingId}')
      })

    })

    describe('delete booking by id', () =>{
      it('Should delete booking by Id', ()=>{
        return pactum.spec().delete('/games/bookings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(204)
      })

      it('Should get bookings', ()=>{
        return pactum.spec().get('/games/bookings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(0)
      })

    })

  })


})