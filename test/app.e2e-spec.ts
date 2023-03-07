import { INestApplication, ValidationPipe } from '@nestjs/common'
import {Test} from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum';
import { AuthSigninDto, AuthSignupDto } from '../src/auth/dto';
import { CreateInvitationDto, EditInvitationDto } from 'src/invitetogame/dto';
import { invitationApproval, gameStatus, teamType } from '@prisma/client';
import { createBookingDto, editBookingDto } from 'src/game/dto';
import { EditVenueDto } from 'src/venue/dto';
import { CreateBranchDto,EditBranchDto } from '../src/branch/dto';
import { CreateCourtDto, EditCourtDto } from '../src/court/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateRequestToJoinDto } from 'src/requesttojoingame/dto/create-request-to-join.dto';
import { EditRequestToJoinDto } from 'src/requesttojoingame/dto/edit-request-to-join.dto';
import { CreateFriendRequestDto } from 'src/addfriend/dto/create-friend-request.dto';
import { EditFriendRequestDto } from 'src/addfriend/dto/edit-friend-request.dto';

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

  // * * * * * * * * * * * AUTHENTICATION * * * * * * * * * * *

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

  // * * * * * * * * * * * USER * * * * * * * * * * *

  describe('User', () => {

    describe('Get me', () =>{
      it('Should get user', ()=>{
      return pactum.spec().get('/users/me',).withHeaders({
        Authorization:'Bearer $S{UserAt}'
      }).expectStatus(200)
    })
    })

    describe('Get users', () =>{
      it('Should get users', ()=>{
      return pactum.spec().get('/users',).withHeaders({
        Authorization:'Bearer $S{UserAt}'
      }).expectStatus(200)
    })
    })

    describe('Get user by Id', () =>{
      it('Should get user', ()=>{
      return pactum.spec().get('/users/{id}',).withPathParams('id','1').withHeaders({
        Authorization:'Bearer $S{UserAt}'
      }).expectStatus(200)
    })
    })
     
    describe('Edit User', () =>{
      it('Should edit user', ()=>{
        const dto : EditUserDto = {
          firstName: 'Sara',
          lastName: 'Al Arab'
        }
        return pactum.spec().patch('/users',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200).expectBodyContains(dto.firstName)
      })
    })

  })

// * * * * * * * * * * * VENUE * * * * * * * * * * *


  describe('Venue', () => {

    describe('Get venues', () =>{
      it('Should get venues', ()=>{
      return pactum.spec().get('/venues',).withHeaders({
        Authorization:'Bearer $S{UserAt}'
      }).expectStatus(200)
    })
    })
    
    describe('Get venue by id', () =>{
      it('Should get venue by id', ()=>{
        return pactum.spec().get('/venues/{id}',).withPathParams('id','1').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200)
      })
    })
     
    // describe('Edit Venue', () =>{
    //   it('Should edit venue', ()=>{
    //     const dto : EditVenueDto = {
    //       managerFirstName: 'Sara',
    //       managerLastName: 'Al Arab'
    //     }
    //     return pactum.spec().patch('/venues',).withHeaders({
    //       Authorization:'Bearer $S{UserAt}'
    //     }).withBody(dto).expectStatus(200).expectBodyContains(dto.managerFirstName)
    //   })
    // })

  })

  // * * * * * * * * * * * COURT * * * * * * * * * * *

  describe('Court', () =>{

    describe('get empty  courts', () =>{
      // it('Should get courts', ()=>{
      //   return pactum.spec().get('/courts',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectBody([])
      // })
    })

    describe('create court', () =>{
      const dto : CreateCourtDto = {
        nbOfPlayers:5,
        branchId:1,
        courtType:'outdoor'
      }
      // it('Should create court', ()=>{
      //   return pactum.spec().post('/courts',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).withBody(dto).expectStatus(201).stores('courtId','id')
      // })
    })

    describe('get courts', () =>{
      it('Should get courts', ()=>{
        return pactum.spec().get('/courts',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(2)
      })
    })

    describe('get court by id', () =>{
      it('Should get court by Id', ()=>{
        return pactum.spec().get('/courts/{id}',).withPathParams('id',1).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains(1)
      })
    })

    describe('edit court by id', () =>{
      const dto : EditCourtDto = {
        courtType:  'indoor'
      }
      // it('Should edit court by Id', ()=>{
      //   return pactum.spec().patch('/courts/{id}',).withPathParams('id','$S{courtId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).withBody(dto).expectStatus(200)
      // })
    })

    describe('delete court by id', () =>{
      // it('Should delete court by Id', ()=>{
      //   return pactum.spec().delete('/courts/{id}',).withPathParams('id','$S{courtId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(204)
      // })

      // it('Should get courts', ()=>{
      //   return pactum.spec().get('/courts',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectJsonLength(0)
      // })
    })
  })

  // * * * * * * * * * * * BRANCH * * * * * * * * * * *

  describe('Branch', () =>{

    describe('get empty  branches', () =>{
      // it('Should get branches', ()=>{
      //   return pactum.spec().get('/branches',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectBody([])
      // })
    })

    describe('create branch', () =>{
      const dto : CreateBranchDto = {
        location:'Hamra',
      }
      // it('Should create branch', ()=>{
      //   return pactum.spec().post('/branches',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).withBody(dto).expectStatus(201).stores('branchesId','id')
      // })
    })

    describe('get branches', () =>{
      it('Should get branches', ()=>{
        return pactum.spec().get('/branches',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(2)
      })
    })

    describe('get branch by id', () =>{
      it('Should get branch by Id', ()=>{
        return pactum.spec().get('/branches/{id}',).withPathParams('id',1).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains(1)
      })
    })

    describe('edit branch by id', () =>{
      const dto : EditBranchDto = {
        rating:  3
      }
      // it('Should edit branch by Id', ()=>{
      //   return pactum.spec().patch('/branches/{id}',).withPathParams('id','$S{bookmarkId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).withBody(dto).expectStatus(200)
      // })
    })

    describe('delete branch by id', () =>{
      // it('Should delete branch by Id', ()=>{
      //   return pactum.spec().delete('/branches/{id}',).withPathParams('id','$S{bookmarkId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(204)
      // })

      // it('Should get branches', ()=>{
      //   return pactum.spec().get('/branches',).withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectJsonLength(0)
      // })
    })
  })

  // * * * * * * * * * * * Friend Requests * * * * * * * * * * *

  describe('Friend Requests', () =>{

    describe('get empty  friend requests', () =>{
      it('Should get sent friend requests', ()=>{
        return pactum.spec().get('/friendrequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })

      it('Should get received friend requests', ()=>{
        return pactum.spec().get('/friendrequests/received',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })
    })

    describe('create friend request', () =>{
      const dto : CreateFriendRequestDto = {
        friendId:2,
      }
      it('Should create friend request', ()=>{
        return pactum.spec().post('/friendrequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(201).stores('friendrequestId','id')
      })
    })
    
    describe('get friend requests', () =>{
      it('Should get friend requests', ()=>{
        return pactum.spec().get('/friendrequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(1)
      })
    })

    describe('get friend request by id', () =>{
      it('Should get sent friend request by Id', ()=>{
        return pactum.spec().get('/friendrequests/{id}',).withPathParams('id','$S{friendrequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{friendrequestId}')
      })

      // it('Should get received friend request by Id', ()=>{
      //   return pactum.spec().get('/friendrequests/received/{id}',).withPathParams('id','$S{friendrequestId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectBodyContains('$S{friendrequestId}')
      // })
    })

    describe('edit friend request by id', () =>{
      const dto : EditFriendRequestDto = {
        status: invitationApproval.APPROVED,
      }
      it('Should edit friend request by Id', ()=>{
        return pactum.spec().patch('/friendrequests/{id}',).withPathParams('id','$S{friendrequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200)
      })
    })
    
    describe('delete invitation by id', () =>{
      it('Should delete friend request by Id', ()=>{
        return pactum.spec().delete('/friendrequests/{id}',).withPathParams('id','$S{friendrequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(204)
      })

      it('Should get friend requests', ()=>{
        return pactum.spec().get('/friendrequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(0)
      })
    })
  })

// * * * * * * * * * * * Game Apis * * * * * * * * * * *

  describe('Game Apis', () =>{

// * * * * * * * * * * * Bookings * * * * * * * * * * *

describe('get empty bookings', () =>{
  it('Should get bookings', ()=>{
    return pactum.spec().get('/games/bookings',).withHeaders({
      Authorization:'Bearer $S{UserAt}'
    }).expectStatus(200).expectBody([])
  })
}) 

// * * * * * * * * * * * Invitations * * * * * * * * * * *

    describe('get empty  invitations', () =>{
      it('Should get sent invitations', ()=>{
        return pactum.spec().get('/invitations',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })

      it('Should get received invitations', ()=>{
        return pactum.spec().get('/invitations/received',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })

    })

// * * * * * * * * * * * Game Requests * * * * * * * * * * *

    describe('get empty game requests', () =>{
      it('Should get sent game requests', ()=>{
        return pactum.spec().get('/gamerequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })

      it('Should get received game requests', ()=>{
        return pactum.spec().get('/gamerequests/received',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })
    })

// * * * * * * * * * * * Upcomings * * * * * * * * * * *

    describe('get empty upcomings', () =>{
      it('Should get upcomings', ()=>{
        return pactum.spec().get('/games/upcomings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBody([])
      })
    }) 
  
// * * * * * * * * * * * Create - Update Bookings * * * * * * * * * * *

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
        }).expectStatus(200).expectJsonLength(1)
      })
    })

    describe('get booking by id', () =>{
      it('Should get booking by Id', ()=>{
        return pactum.spec().get('/games/bookings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{bookingId}')
      })
    })

    describe('edit booking by id', () =>{
      const dto : editBookingDto = {
        status: gameStatus.FINISHED
      }
      it('Should edit booking by Id', ()=>{
        return pactum.spec().patch('/games/bookings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200)
      })
    })

// * * * * * * * * * * * Create - Update Invitations * * * * * * * * * * *

    describe('create invitation', () =>{
      const dto : CreateInvitationDto = {
        friendId:2,
        gameId:1,
        team: teamType.AWAY
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
        }).expectStatus(200).expectJsonLength(1)
      })
    })

    describe('get invitation by id', () =>{
      it('Should get sent invitation by Id', ()=>{
        return pactum.spec().get('/invitations/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{invitationId}')
      })

      // it('Should get received invitation by Id', ()=>{
      //   return pactum.spec().get('/invitations/received/{id}',).withPathParams('id','$S{invitationId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectBodyContains('$S{invitationId}')
      // })
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
  
// * * * * * * * * * * * Create - Update Game Requests * * * * * * * * * * *

    describe('create game request', () =>{
      const dto : CreateRequestToJoinDto = {
        gameId:1,
        team: teamType.AWAY
      }
      it('Should create game request', ()=>{
        return pactum.spec().post('/gamerequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(201).stores('gamerequestId','id')
      })
    })

    describe('get game requests', () =>{
      it('Should get game requests', ()=>{
        return pactum.spec().get('/gamerequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(1)
      })
    })

    describe('get game request by id', () =>{
      it('Should get sent game request by Id', ()=>{
        return pactum.spec().get('/gamerequests/{id}',).withPathParams('id','$S{gamerequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{gamerequestId}')
      })

      // it('Should get received game request by Id', ()=>{
      //   return pactum.spec().get('/gamerequests/received/{id}',).withPathParams('id','$S{gamerequestId}').withHeaders({
      //     Authorization:'Bearer $S{UserAt}'
      //   }).expectStatus(200).expectBodyContains('$S{gamerequestId}')
      // })
    })

    describe('edit game request by id', () =>{
      const dto : EditRequestToJoinDto = {
        status: invitationApproval.APPROVED,
      }
      it('Should edit game request by Id', ()=>{
        return pactum.spec().patch('/gamerequests/{id}',).withPathParams('id','$S{gamerequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).withBody(dto).expectStatus(200)
      })
    })

// * * * * * * * * * * * Game Upcomings * * * * * * * * * * *

    describe('get upcomings', () =>{
      it('Should get upcomings', ()=>{
        return pactum.spec().get('/games/upcomings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(2)
      })
    })

    describe('get upcoming by id', () =>{
      it('Should get upcoming by Id', ()=>{
        return pactum.spec().get('/games/upcomings/{id}',).withPathParams('id','$S{bookingId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectBodyContains('$S{bookingId}')
      })
    })

// * * * * * * * * * * * Game Updates * * * * * * * * * * *

    describe('Get Game Updates', ()=>{
      it('Shoud get Game Updates', ()=>{
        return pactum.spec().get('/games/updates/{id}',).withPathParams('id','1').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200)
      })
    })

// * * * * * * * * * * * Game Activities * * * * * * * * * * *

    describe('Get Game Activities', ()=>{
      it('Shoud get activities', ()=>{
        return pactum.spec().get('/games/activities').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200)
      })
    })
    
// * * * * * * * * * * * Game Activities * * * * * * * * * * *

describe('Get player status', ()=>{
  it('Shoud get player status', ()=>{
    return pactum.spec().get('/games/playerstatus').withHeaders({
      Authorization:'Bearer $S{UserAt}'
    }).withQueryParams({'gameId': '1'}).expectStatus(200).inspect()
  })
})

// * * * * * * * * * * * Delete Invitations and Game Requests and Bookings * * * * * * * * * * *


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

    describe('delete game request by id', () =>{
      it('Should delete game request by Id', ()=>{
        return pactum.spec().delete('/gamerequests/{id}',).withPathParams('id','$S{gamerequestId}').withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(204)
      })

      it('Should get game requests', ()=>{
        return pactum.spec().get('/gamerequests',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(0)
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

      it('Should get upcomings', ()=>{
        return pactum.spec().get('/games/upcomings',).withHeaders({
          Authorization:'Bearer $S{UserAt}'
        }).expectStatus(200).expectJsonLength(0)
      })
    })

  })

})