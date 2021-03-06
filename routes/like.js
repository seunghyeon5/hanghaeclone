const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

const Like = require('../models/like');


router.get('/like/:itemId', async (req, res) => {
    try{ 
    const { itemId } = req.params;
    const totalLike = await Like.find({itemId}).exec();
    res.status(200).json(totalLike);
    }catch (error) {    
        res.status(400).send({
            errorMessage: 'error',
        });
    }
});

router.post('/like/:itemId',authMiddleware ,async (req, res) => {
    try{                      
        const {itemId} = req.params;
        const { nickname } = res.locals.user;           
        
        const findLike = await Like.findOne({ itemId, nickname });
        //console.log(findLike);

        if(findLike){          
            //return res.status(400).send({errorMessage: "이미 좋아요를 누름"})//테스트 메세지
            return res.status(400).send({errorMessage: "fail"});
        }
        await Like.create({            
            itemId,
            nickname,
          });    
          //return res.status(201).json({ like, msg: "좋아요 완료!" });     //테스트 메세지
          return res.status(201).json({result: "success" });
      
    } catch (error) {    
        res.status(400).send({
            errorMessage: 'error',
        });
    }
    
});
router.delete('/cancel/:itemId',authMiddleware ,async (req, res)=> {
    try{ 
        const { itemId } = req.params;
        const { nickname } = res.locals.user;
    
        const findLike = await Like.findOne({ itemId,nickname }).exec();
    
        if (!findLike) {
        //return res.status(40).send({ errorMessage: "좋아요를 찾을 수 없습니다." }); //메스트 메세지
        return res.status(400).send({ errorMessage: "fail" });
        }
    
        await Like.deleteOne(findLike);
        return res.status(200).json({ result: "success" });
    }catch (error) {    
        res.status(400).send({
            errorMessage: 'error',
        });
    }

});


module.exports = router;

