import { INestApplication, ValidationPipe } from '@nestjs/common'
import {Test} from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum';
import { AuthSigninDto, AuthSignupDto } from '../src/auth/dto';
import { CreateInvitationDto, EditInvitationDto } from 'src/invitetogame/dto';
import { invitationApproval } from '@prisma/client';

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
    await prisma.CleanDb();
    pactum.request.setBaseUrl('http://localhost:3333')

  })

  afterAll(() =>{
    app.close();
  })

  describe('Auth', () => {
    const dto_signup :AuthSignupDto = {
      email:'saraalarab2000@gmail.com',
      phoneNumber:"03027609",
      firstName:"Sara",
      lastName:"Al Arab",
      password:'123'
    }
    const dto_signin :AuthSigninDto = {
      email:'saraalarab2000@gmail.com',
      password:'123'
    }
    describe('Signup', () =>{
      it('Should throw error if email is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({password: dto_signup.password, phoneNumber: dto_signup.phoneNumber, firstName: dto_signup.firstName, lastName: dto_signup.lastName}).expectStatus(400)
      })

      it('Should throw error if password is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup.email, phoneNumber: dto_signup.phoneNumber, firstName: dto_signup.firstName, lastName: dto_signup.lastName}).expectStatus(400)
      })

      it('Should throw error if phoneNumber is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup.email,password: dto_signup.password, firstName: dto_signup.firstName, lastName: dto_signup.lastName}).expectStatus(400)
      })

      it('Should throw error if firstName is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup.email,password: dto_signup.password, phoneNumber: dto_signup.phoneNumber,  lastName: dto_signup.lastName}).expectStatus(400)
      })

      it('Should throw error if lastName is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).withBody({email: dto_signup.email,password: dto_signup.password, phoneNumber: dto_signup.phoneNumber,  firstName: dto_signup.firstName}).expectStatus(400)
      })

      it('Should throw error if body is empty ', ()=>{
        return pactum.spec().post('/auth/signup',).expectStatus(400)
      })

      it('Should signup', ()=>{
        return pactum.spec().post('/auth/signup',).withBody(dto_signup).expectStatus(201)
      })
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
        friendId:1,
        gameId:1,

      }
      it('Should create invitation', ()=>{
        return pactum.spec().post('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(201).stores('invitationId','id').inspect()
      })

    })
    describe('get invitations', () =>{
      it('Should get invitations', ()=>{
        return pactum.spec().get('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(1)
      })


    })
    describe('get invitation by id', () =>{
      it('Should get invitation by Id', ()=>{
        return pactum.spec().get('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{invitationId}')
      })

    })
    describe('edit invitation by id', () =>{
      const dto : EditInvitationDto = {
        status: invitationApproval.APPROVED,
      }
      it('Should edit invitation by Id', ()=>{
        return pactum.spec().patch('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200)
      })

    })
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
 
})