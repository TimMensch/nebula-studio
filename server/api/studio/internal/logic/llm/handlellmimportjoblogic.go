package llm

import (
	"context"

	"github.com/vesoft-inc/nebula-studio/server/api/studio/internal/service/llm"
	"github.com/vesoft-inc/nebula-studio/server/api/studio/internal/svc"
	"github.com/vesoft-inc/nebula-studio/server/api/studio/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type HandleLLMImportJobLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewHandleLLMImportJobLogic(ctx context.Context, svcCtx *svc.ServiceContext) HandleLLMImportJobLogic {
	return HandleLLMImportJobLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *HandleLLMImportJobLogic) HandleLLMImportJob(req types.HandleLLMImportRequest) (resp *types.LLMResponse, err error) {
	return llm.NewLLMService(l.ctx, l.svcCtx).HandleLLMImportJob(&req)
}
