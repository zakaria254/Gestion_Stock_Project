<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $articles = Article::latest()->with('stock')->paginate($this->perPage());

        return ArticleResource::collection($articles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateArticleRequest $request)
    {
        $validated = $request->validated();
        $article = Article::create($validated);

        return (new ArticleResource($article))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
    {
        return new ArticleResource($article->load('stock'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateArticleRequest $request, Article $article)
    {
        $validated = $request->validated();
        $article->update($validated);

        return new ArticleResource($article);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        $article->delete();

        return response()->noContent();
    }
}
