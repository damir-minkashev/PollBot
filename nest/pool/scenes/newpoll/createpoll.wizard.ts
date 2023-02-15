import {Action, Command, Context, Hears, On, Scene, SceneEnter} from "nestjs-telegraf";

@Scene('createpoll')
export class CreatePollWizard {

    constructor() {}

    @SceneEnter()
    onEnter(@Context() ctx: any) {
        ctx.reply("Пришлите название опроса 1");
    }

    @On('text')
    onPoolName(@Context() ctx: any ){
        // ctx.scene.leave();
        return "Спасибо!";
    }

}

